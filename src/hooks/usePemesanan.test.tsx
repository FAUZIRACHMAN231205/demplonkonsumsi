import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { PemesananProvider, useSharedPemesanan } from '@/context/PemesananContext';
import createMockStorage from '@/lib/mockStorage';

function TestConsumer() {
  const ctx = useSharedPemesanan();
  const { counts, riwayat, actions, selectedOrder } = ctx;

  return (
    <div>
      <div data-testid="count">{counts.Total}</div>
      <div data-testid="status">{riwayat[0]?.status ?? 'none'}</div>
      <button onClick={() => actions.addOrder({
        acara: 'Test Event',
        tanggalPermintaan: new Date().toISOString(),
        tanggalPengiriman: new Date().toISOString(),
        waktu: '09:00',
        lokasi: 'Lab',
        tamu: 'Internal',
        yangMengajukan: 'Tester',
    untukBagian: 'Divisi IT',
        approval: 'Manager',
        konsumsi: [{ jenis: 'Nasi', satuan: 'box', qty: '1' }],
      })}>
        Add
      </button>
      <button onClick={() => {
        if (riwayat[0]) actions.updateStatus(riwayat[0].id, 'Disetujui', 'Tester');
      }}>Approve</button>
      <button onClick={() => {
        if (riwayat[0]) {
            // For testing, call deleteById directly to avoid modal/timing issues
            actions.deleteById(riwayat[0].id);
          }
      }}>Delete</button>
      <button onClick={() => actions.exportCSV()}>Export</button>
      <div data-testid="selected">{selectedOrder?.acara ?? ''}</div>
    </div>
  );
}

describe('usePemesanan (integration)', () => {
  let mock: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mock = createMockStorage({ riwayatPemesanan: [] });
    cleanup();
  });

  it('addOrder persists and increments count', async () => {
    render(
      <PemesananProvider storageAdapter={mock}>
        <TestConsumer />
      </PemesananProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
  });

  it('updateStatus adds history and updates status', async () => {
    render(
      <PemesananProvider storageAdapter={mock}>
        <TestConsumer />
      </PemesananProvider>
    );

    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));

    fireEvent.click(screen.getByText('Approve'));
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('Disetujui'));
  });

  it('delete removes order', async () => {
    render(
      <PemesananProvider storageAdapter={mock}>
        <TestConsumer />
      </PemesananProvider>
    );

    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));

    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'));
  });

  it('exportCSV triggers download', async () => {
    const clickSpy = vi.fn();
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tagName) => {
      if (tagName === 'a') {
        const anchor = originalCreate(tagName) as HTMLAnchorElement;
        anchor.click = clickSpy;
        return anchor;
      }
      return originalCreate(tagName);
    }) as typeof document.createElement);

    render(
      <PemesananProvider storageAdapter={mock}>
        <TestConsumer />
      </PemesananProvider>
    );

    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));

    fireEvent.click(screen.getByText('Export'));
    await waitFor(() => expect(appendSpy).toHaveBeenCalled());

    vi.restoreAllMocks();
  });
});
