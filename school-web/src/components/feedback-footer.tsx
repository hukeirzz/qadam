import { MailIcon } from './icons';

const FEEDBACK_EMAIL = 'dastantoktobekov2@gmail.com';

/** Подвал страницы: куда писать с предложениями, жалобами и отзывами. */
export function FeedbackFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
      <p>Есть предложение, жалоба или отзыв о Qadam? Напишите нам:</p>
      <a
        href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Qadam: отзыв')}`}
        className="mt-1.5 inline-flex items-center gap-1.5 font-semibold text-brand hover:text-brand-hover"
      >
        <MailIcon className="h-4 w-4" /> {FEEDBACK_EMAIL}
      </a>
    </footer>
  );
}
