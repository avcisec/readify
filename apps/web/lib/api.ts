export class ApiProblem extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly details: Record<string, unknown>,
  ) {
    super(code);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const details = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    throw new ApiProblem(
      response.status,
      String(details.code ?? "request_failed"),
      details,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function idempotencyKey(): string {
  return crypto.randomUUID();
}

export function turkishProblem(code: string): string {
  const messages: Record<string, string> = {
    authentication_required: "Oturumunuz sona erdi. Yeniden giriş yapın.",
    empty_text: "Okumak istediğiniz metni yapıştırın.",
    text_too_long: "Metin 50.000 karakter sınırını aşıyor.",
    language_mismatch:
      "Bu çalışma alanına yalnızca Fransızca metin eklenebilir. Metni kontrol edip yeniden deneyin.",
    learning_profile_required: "Önce kısa öğrenme profilinizi tamamlayın.",
    reader_not_ready: "Metin henüz hazırlanıyor.",
    stale_state_change:
      "Bu değişiklikten sonra başka bir işlem yapıldığı için geri alınamıyor.",
    file_required: "Lütfen bir dosya seçin.",
    file_too_large: "Dosya 200 MB sınırını aşıyor.",
    unsupported_file_type: "Yalnızca PDF veya EPUB dosyası seçebilirsiniz.",
    file_drm_unsupported: "DRM korumalı EPUB dosyaları desteklenmiyor.",
    file_no_extractable_text:
      "Bu dosyada okunabilir metin bulunamadı. Taranmış PDF desteklenmiyor.",
    file_parse_failed:
      "Dosya okunamadı. Dosyanın bozuk veya desteklenmeyen bir EPUB/PDF olmadığını kontrol edin.",
  };
  return messages[code] ?? "İşlem tamamlanamadı. Lütfen yeniden deneyin.";
}
