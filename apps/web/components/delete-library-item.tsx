"use client";

import { useEffect, useRef, useState } from "react";
import { api, turkishProblem } from "../lib/api";

export function DeleteLibraryItem({
  itemId,
  title,
  onDeleted,
}: {
  itemId: string;
  title: string;
  onDeleted: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!open || !dialog.current) return;
    dialog.current.showModal();
    cancel.current?.focus();
    return () => dialog.current?.close();
  }, [open]);

  async function remove() {
    setBusy(true);
    setMessage(undefined);
    try {
      await api(`/api/v1/library-items/${itemId}`, { method: "DELETE" });
      setOpen(false);
      onDeleted();
    } catch (error) {
      setMessage(
        turkishProblem(
          error instanceof Error ? error.message : "request_failed",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="danger-link"
        onClick={() => setOpen(true)}
      >
        Kitabı sil
      </button>
      {open ? (
        <dialog
          ref={dialog}
          className="confirm-dialog"
          aria-labelledby={`delete-title-${itemId}`}
          onCancel={(event) => {
            event.preventDefault();
            if (!busy) setOpen(false);
          }}
        >
          <h2 id={`delete-title-${itemId}`}>Kitabı silmek istiyor musun?</h2>
          <p>
            <strong>{title}</strong> ve bu kitaba bağlı okuma konumu kalıcı
            olarak silinecek.
          </p>
          <p className="inline-message" aria-live="polite">
            {message}
          </p>
          <div className="dialog-actions">
            <button
              ref={cancel}
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className="danger-button"
              disabled={busy}
              onClick={() => void remove()}
            >
              {busy ? "Siliniyor…" : "Kalıcı olarak sil"}
            </button>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
