'use client';

import { useEffect, useMemo, useState } from 'react';
import { submitCustomerPaymentProof } from '@/lib/api';
import { resolveAssetUrl } from '@/lib/assetUrl';
import PaymentMethodCard, { PaymentCopyButton } from '@/components/payment/PaymentMethodCard';

const formatRp = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRemaining = (seconds) => {
  const safe = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

export default function CustomerPaymentPanel({ order, onOrderUpdate, compact = false }) {
  const [now, setNow] = useState(Date.now());
  const [proof, setProof] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [accountCopyMessage, setAccountCopyMessage] = useState('');
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const method = order?.payment_method || null;
  const payableTotal = Number(order?.final_total || order?.subtotal || 0);
  const dueAt = order?.payment_due_at ? new Date(order.payment_due_at).getTime() : null;
  const remainingSeconds = dueAt ? Math.max(0, Math.floor((dueAt - now) / 1000)) : null;
  const isExpired = dueAt ? remainingSeconds <= 0 : false;
  const hasProof = Boolean(order?.payment_proof_url || order?.payment_submitted_at);
  const isPaid = order?.payment_status === 'paid';

  const instructionLines = useMemo(() => {
    const raw = String(method?.instructions || '').trim();
    if (!raw) {
      return [
        'Pastikan nominal pembayaran sama dengan total bayar.',
        'Setelah transfer/scan QRIS berhasil, unggah bukti pembayaran dari halaman ini.',
        'Kasir akan memeriksa bukti pembayaran sebelum pesanan diproses selesai.',
      ];
    }
    return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }, [method?.instructions]);

  useEffect(() => {
    if (!dueAt || hasProof || isPaid) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [dueAt, hasProof, isPaid]);

  if (!method) return null;

  const copyAmount = async () => {
    try {
      await navigator.clipboard.writeText(String(Math.round(payableTotal)));
      setCopyMessage('Nominal disalin');
      window.setTimeout(() => setCopyMessage(''), 1800);
    } catch {
      setCopyMessage('Gagal menyalin nominal');
      window.setTimeout(() => setCopyMessage(''), 1800);
    }
  };

  const copyAccount = async () => {
    if (!method.account_number) return;
    try {
      await navigator.clipboard.writeText(String(method.account_number));
      setAccountCopyMessage('Rekening disalin');
      window.setTimeout(() => setAccountCopyMessage(''), 1800);
    } catch {
      setAccountCopyMessage('Gagal menyalin');
      window.setTimeout(() => setAccountCopyMessage(''), 1800);
    }
  };

  const qrUrl = method.qr_image_url ? resolveAssetUrl(method.qr_image_url) : '';
  const proofUrl = order?.payment_proof_url ? resolveAssetUrl(order.payment_proof_url) : '';

  const submitProof = async () => {
    if (!proof) {
      alert('Pilih foto atau file bukti pembayaran terlebih dahulu.');
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('proof', proof);
      data.append('note', note);
      const res = await submitCustomerPaymentProof(order.order_code, data);
      onOrderUpdate?.(res.data?.data || res.data);
      setProof(null);
      setNote('');
      alert('Bukti pembayaran berhasil dikirim. Kasir akan melakukan konfirmasi.');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim bukti pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`mt-5 overflow-hidden rounded-3xl border border-[#C9A84C]/20 bg-[#241C0E] ${compact ? 'p-4' : 'p-5'} text-[#F5EDD8]`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <PaymentMethodCard method={method} compact />
        <div className="rounded-2xl border border-[#C9A84C]/18 bg-[#0D0A06]/55 px-4 py-3">
          <p className="text-xs text-[#EDE0C4]/65">Batas pembayaran</p>
          <strong className={`mt-1 block text-2xl ${isExpired && !hasProof && !isPaid ? 'text-red-200' : 'text-[#F5EDD8]'}`}>
            {hasProof || isPaid ? 'Terkirim' : dueAt ? formatRemaining(remainingSeconds) : '-'}
          </strong>
          {dueAt && <p className="mt-1 text-[11px] text-[#EDE0C4]/55">Sampai {formatDateTime(order.payment_due_at)}</p>}
        </div>
      </div>

      <div className={`mt-4 grid min-w-0 gap-4 ${method.type === 'qris' && method.qr_image_url ? 'xl:grid-cols-[minmax(180px,240px)_1fr]' : ''}`}>
        {method.type === 'qris' && method.qr_image_url && (
          <div className="min-w-0">
            <img
              src={qrUrl}
              alt={method.name}
              className="aspect-square w-full max-w-60 rounded-2xl border border-[#C9A84C]/20 bg-white object-contain p-2"
            />
            <a
              href={qrUrl}
              download
              className="mt-2 inline-flex w-full max-w-60 justify-center rounded-xl border border-[#C9A84C]/25 px-3 py-2 text-xs font-black text-[#F5EDD8]"
            >
              Download QR
            </a>
          </div>
        )}
        <div className="min-w-0 space-y-3">
          {method.account_number && (
            <div className="flex flex-col gap-2 rounded-2xl bg-[#0D0A06]/55 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[#EDE0C4]/65">Nomor rekening / akun tujuan</p>
                <strong className="break-all text-lg text-[#F5EDD8]">{method.account_number}</strong>
              </div>
              <PaymentCopyButton onClick={copyAccount} copied={Boolean(accountCopyMessage)} copiedLabel={accountCopyMessage} label="Copy Rekening" />
            </div>
          )}
          <div className="rounded-2xl bg-[#0D0A06]/55 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C9A84C]">Tata cara bayar</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm leading-6 text-[#F5EDD8]/85">
              {instructionLines.map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}
            </ol>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-[#0D0A06]/55 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-[#EDE0C4]/65">Total yang harus dibayar</p>
              <strong className="text-2xl text-emerald-300">{formatRp(payableTotal)}</strong>
            </div>
            <PaymentCopyButton onClick={copyAmount} copied={Boolean(copyMessage)} copiedLabel={copyMessage} label="Copy Nominal" />
          </div>
        </div>
      </div>

      {isPaid ? (
        <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-500/15 p-3 text-sm text-emerald-100">
          Pembayaran sudah dikonfirmasi kasir.
        </div>
      ) : hasProof ? (
        <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-500/15 p-3 text-sm text-emerald-100">
          Bukti pembayaran sudah dikirim pada {formatDateTime(order.payment_submitted_at)}. Menunggu konfirmasi kasir.
          {order.payment_proof_url && (
            <button type="button" onClick={() => setProofModalOpen(true)} className="mt-2 block font-black underline">
              Lihat bukti pembayaran
            </button>
          )}
        </div>
      ) : isExpired ? (
        <div className="mt-4 rounded-2xl border border-red-300/25 bg-red-500/15 p-3 text-sm text-red-100">
          Waktu pembayaran sudah habis. Silakan hubungi kasir untuk membuat pembayaran ulang.
        </div>
      ) : (
        <div className="mt-4 space-y-3 rounded-2xl bg-[#0D0A06]/45 p-3">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(event) => setProof(event.target.files?.[0] || null)}
            className="w-full rounded-xl border border-sky-100/20 bg-[#0D0A06] px-4 py-3 text-sm text-sky-50 outline-none"
          />
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Catatan pembayaran (opsional)"
            className="max-h-28 w-full rounded-xl border border-sky-100/20 bg-[#0D0A06] px-4 py-3 text-sm text-sky-50 outline-none"
          />
          <button
            type="button"
            onClick={submitProof}
            disabled={submitting}
            className="w-full rounded-xl bg-sky-300 px-4 py-3 text-sm font-black text-[#0D0A06] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Mengirim bukti...' : 'Konfirmasi & Kirim Bukti Pembayaran'}
          </button>
        </div>
      )}
      {proofModalOpen && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-sky-200/20 bg-[#101820] p-4 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">Bukti Pembayaran</p>
                <h3 className="mt-1 text-lg font-black text-white">{order.order_code}</h3>
              </div>
              <button type="button" onClick={() => setProofModalOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-lg font-black text-white">
                x
              </button>
            </div>
            {proofUrl.toLowerCase().includes('.pdf') ? (
              <div className="mt-4 rounded-2xl bg-black/25 p-5 text-sm text-sky-50">
                File bukti berupa PDF.
                <a href={proofUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl bg-sky-300 px-4 py-2 font-black text-[#0D0A06]">
                  Buka PDF
                </a>
              </div>
            ) : (
              <img src={proofUrl} alt="Bukti pembayaran" className="mt-4 max-h-[70vh] w-full rounded-2xl bg-white object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
