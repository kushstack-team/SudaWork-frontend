import { useEffect, useRef, useState } from 'react';
import { FiDownload, FiExternalLink, FiFile, FiFileText, FiImage, FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';
import { api } from '../../services/api';
import './FileViewer.css';

const kindOf = (type = '', name = '') => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (type === 'application/pdf' || ext === 'pdf') return 'pdf';
  return 'other';
};

const KIND_ICON = { image: FiImage, pdf: FiFileText, other: FiFile };

/**
 * In-app file viewer for every uploaded file (chat attachments, project and
 * contract files, payment proofs). Mounted once at the app root; opened with
 * api.uploads.open(file). Images and PDFs display inside the platform; other
 * types (Word, ZIP) get a clear download card.
 */
export default function FileViewer() {
  const [file, setFile] = useState(null);
  const [blobUrl, setBlobUrl] = useState('');
  const [kind, setKind] = useState('other');
  const [error, setError] = useState('');
  const [zoomed, setZoomed] = useState(false);
  const closeRef = useRef(null);

  // Open requests come from api.uploads.open() anywhere in the app.
  useEffect(() => {
    const onOpen = (event) => {
      setFile(event.detail);
      setBlobUrl('');
      setError('');
      setZoomed(false);
      setKind(kindOf(event.detail?.type, event.detail?.name));
    };
    window.addEventListener('sudawork:open-file', onOpen);
    return () => window.removeEventListener('sudawork:open-file', onOpen);
  }, []);

  // Fetch the file (with the session for private ones) as a local object URL.
  useEffect(() => {
    if (!file) return undefined;
    let url = '';
    let cancelled = false;
    api.uploads.fetchBlob(file).then(
      (blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setKind(kindOf(blob.type || file.type, file.name));
        setBlobUrl(url);
      },
      (err) => !cancelled && setError(err.message || 'تعذر فتح الملف.')
    );
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // Escape closes; the page behind doesn't scroll while the viewer is open.
  useEffect(() => {
    if (!file) return undefined;
    const onKey = (e) => e.key === 'Escape' && setFile(null);
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [file]);

  if (!file) return null;

  const close = () => setFile(null);
  const download = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name || 'file';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const Icon = KIND_ICON[kind];

  return (
    <div className="file-viewer" role="dialog" aria-modal="true" aria-labelledby="file-viewer-title" dir="rtl" onClick={close}>
      <div className="file-viewer__frame" onClick={(e) => e.stopPropagation()}>
        <header className="file-viewer__bar">
          <span className="file-viewer__type" aria-hidden="true"><Icon /></span>
          <div className="file-viewer__heading">
            <h2 id="file-viewer-title" className="file-viewer__name" title={file.name}>{file.name || 'ملف'}</h2>
            {file.size && <span className="file-viewer__size">{file.size}</span>}
          </div>
          <div className="file-viewer__actions">
            {kind === 'image' && blobUrl && (
              <button type="button" className="file-viewer__btn" onClick={() => setZoomed((z) => !z)} title={zoomed ? 'ملاءمة الشاشة' : 'الحجم الكامل'}>
                {zoomed ? <FiMinimize2 /> : <FiMaximize2 />}
              </button>
            )}
            <a
              className={`file-viewer__btn ${blobUrl ? '' : 'is-disabled'}`}
              href={blobUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              title="فتح في نافذة جديدة"
              aria-disabled={!blobUrl}
            >
              <FiExternalLink />
            </a>
            <button type="button" className="file-viewer__btn" onClick={download} disabled={!blobUrl} title="تنزيل">
              <FiDownload />
            </button>
            <button type="button" ref={closeRef} className="file-viewer__btn file-viewer__close" onClick={close} title="إغلاق" aria-label="إغلاق">
              <FiX />
            </button>
          </div>
        </header>

        <div className={`file-viewer__body file-viewer__body--${kind} ${zoomed ? 'is-zoomed' : ''}`}>
          {error ? (
            <div className="file-viewer__message" role="alert">
              <FiFile className="file-viewer__message-icon" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : !blobUrl ? (
            <div className="file-viewer__message" role="status">
              <span className="file-viewer__spinner" aria-hidden="true" />
              <p>جارٍ فتح الملف...</p>
            </div>
          ) : kind === 'image' ? (
            <img src={blobUrl} alt={file.name || ''} className="file-viewer__image" onClick={() => setZoomed((z) => !z)} />
          ) : kind === 'pdf' ? (
            <iframe src={blobUrl} title={file.name || 'ملف PDF'} className="file-viewer__pdf" />
          ) : (
            <div className="file-viewer__message">
              <FiFile className="file-viewer__message-icon" aria-hidden="true" />
              <p className="file-viewer__message-title">لا يمكن عرض هذا النوع من الملفات داخل المنصة</p>
              <p>يمكنك تنزيله وفتحه على جهازك.</p>
              <button type="button" className="file-viewer__download" onClick={download}>
                <FiDownload aria-hidden="true" /> تنزيل الملف
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
