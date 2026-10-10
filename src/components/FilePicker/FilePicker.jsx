import { useLayoutEffect, useRef } from 'react';
import { FiPaperclip, FiX, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { api } from '../../services/api';
import './FilePicker.css';

const MAX_BYTES = 50 * 1024 * 1024;
const DEFAULT_ACCEPT = '.pdf,.doc,.docx,.zip,.png,.jpg,.jpeg';

let nextKey = 0;

/**
 * Uploads files immediately on selection and reports each one's state.
 * `files` items: { key, name, status: 'uploading' | 'done' | 'error', progress, upload, error }.
 * Parents read `upload.id` from finished items when submitting their form.
 */
export default function FilePicker({
  id,
  purpose = 'other',
  multiple = false,
  maxFiles = 1,
  accept = DEFAULT_ACCEPT,
  files,
  onChange,
  disabled = false,
}) {
  const inputRef = useRef(null);
  // Uploads finish asynchronously; the ref lets them update the latest list.
  const filesRef = useRef(files);
  useLayoutEffect(() => {
    filesRef.current = files;
  }, [files]);

  const update = (key, patch) => {
    onChange(filesRef.current.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  };

  const startUpload = async (item, file) => {
    try {
      const upload = await api.uploads.upload(file, {
        purpose,
        onProgress: (progress) => update(item.key, { progress }),
      });
      update(item.key, { status: 'done', progress: 100, upload });
    } catch (err) {
      update(item.key, { status: 'error', error: err.message, file });
    }
  };

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    const room = Math.max(0, maxFiles - files.length);
    const accepted = selected.slice(0, multiple ? room : 1);
    const items = accepted.map((file) => {
      const item = { key: `f${++nextKey}`, name: file.name, progress: 0 };
      if (file.size > MAX_BYTES) return { ...item, status: 'error', error: 'حجم الملف يتجاوز 50 ميجابايت.' };
      return { ...item, status: 'uploading', file };
    });
    const base = multiple ? files : [];
    filesRef.current = [...base, ...items];
    onChange(filesRef.current);
    items.filter((i) => i.status === 'uploading').forEach((i) => startUpload(i, i.file));
  };

  const remove = (key) => onChange(files.filter((f) => f.key !== key));

  const retry = (item) => {
    update(item.key, { status: 'uploading', progress: 0, error: '' });
    startUpload(item, item.file);
  };

  const canAdd = multiple ? files.length < maxFiles : true;

  return (
    <div className="file-picker">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleSelect}
        disabled={disabled}
        className="file-picker-input"
      />
      {canAdd && (
        <button type="button" className="file-picker-trigger" onClick={() => inputRef.current?.click()} disabled={disabled}>
          <FiPaperclip />
          <span>{files.length > 0 && !multiple ? 'استبدال الملف' : 'اختيار ملف'}</span>
          <span className="file-picker-hint">PDF, DOC, DOCX, ZIP, PNG, JPG — حتى 50 ميجابايت</span>
        </button>
      )}

      {files.length > 0 && (
        <ul className="file-picker-list">
          {files.map((f) => (
            <li key={f.key} className={`file-picker-item is-${f.status}`}>
              <FiPaperclip className="file-picker-icon" />
              <span className="file-picker-name">{f.name}</span>
              {f.status === 'uploading' && <span className="file-picker-progress">{f.progress}%</span>}
              {f.status === 'error' && (
                <span className="file-picker-error">
                  <FiAlertCircle /> {f.error}
                </span>
              )}
              {f.status === 'error' && f.file && (
                <button type="button" className="file-picker-action" onClick={() => retry(f)} title="إعادة المحاولة">
                  <FiRefreshCw />
                </button>
              )}
              {f.status !== 'uploading' && (
                <button type="button" className="file-picker-action" onClick={() => remove(f.key)} title="إزالة" disabled={disabled}>
                  <FiX />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
