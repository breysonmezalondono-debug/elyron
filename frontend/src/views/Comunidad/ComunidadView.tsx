import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Heart,
  Megaphone,
  MessageCircle,
  MessageSquareQuote,
  Pin,
  SendHorizonal,
  Users,
} from 'lucide-react';
import { Elir } from '../../components/elyron/Elir';
import { IconTile } from '../../components/elyron/IconTile';
import { useInstitution } from '../../context/useInstitution';
import { pluralize } from '../../model/institution';
import {
  ANNOUNCEMENTS,
  CATEGORY_LABELS,
  COMMUNITY_CATEGORIES,
  INITIAL_POSTS,
  INITIAL_TEACHER_QUESTIONS,
} from '../../model/mock/communityData';
import type {
  AnnouncementAudience,
  CommunityCategory,
  CommunityPost,
  TeacherQuestion,
} from '../../model/mock/communityData';

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const cascade: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  });

const initialsOf = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('');

type ChannelId = 'foro' | 'comunicados' | 'docente';

const CHANNELS: { id: ChannelId; label: string }[] = [
  { id: 'foro', label: 'Foro del grupo' },
  { id: 'comunicados', label: 'Comunicados' },
  { id: 'docente', label: 'Preguntas al docente' },
];

const ForoChannel = () => {
  const { institution, terminology } = useInstitution();
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [categoryFilter, setCategoryFilter] = useState<'todas' | CommunityCategory>('todas');

  const filtered = useMemo(
    () =>
      categoryFilter === 'todas'
        ? posts
        : posts.filter((p) => p.category === categoryFilter),
    [posts, categoryFilter],
  );

  const roleText = (p: CommunityPost) => {
    if (p.authorRole === 'instructor') return terminology.instructor;
    if (p.authorRole === 'companion') return `Compañera · ${terminology.group} ${p.groupCode}`;
    return terminology.apprentice;
  };

  const publish = (e: FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosts((prev) => [
      {
        id: `post-${Date.now()}`,
        author: 'Tú',
        authorRole: 'apprentice',
        groupCode: null,
        category: 'general',
        content: newPost.trim(),
        likesCount: 0,
        likedByMe: false,
        comments: [],
        reports: [],
      },
      ...prev,
    ]);
    setNewPost('');
  };

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) }
          : p,
      ),
    );
  };

  const addComment = (e: FormEvent, postId: string) => {
    e.preventDefault();
    const text = drafts[postId]?.trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, { id: `c-${Date.now()}`, author: 'Tú', content: text }] }
          : p,
      ),
    );
    setDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6">
      <motion.div variants={rise} initial="hidden" animate="show" className="surface flex items-start gap-3 p-4">
        <Users size={15} className="mt-0.5 shrink-0 text-mint-600" />
        <p className="text-xs font-semibold leading-relaxed text-ink-500">
          Mensajería oficial con tu <strong className="text-ink-800">{terminology.group}</strong> y tus{' '}
          <strong className="text-ink-800">{pluralize(terminology.instructor)}</strong> del programa{' '}
          <strong className="text-ink-800">{institution.name}</strong>.
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-1.5">
        {(['todas', ...COMMUNITY_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
              categoryFilter === cat
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-500 ring-1 ring-line hover:text-ink-900'
            }`}
          >
            {cat === 'todas' ? 'Todas' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <form onSubmit={publish} className="surface space-y-3 p-4">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder={`Comparte algo útil con tu ${terminology.group}…`}
          rows={2}
          className="input resize-none"
        />
        <div className="flex justify-end">
          <button type="submit" disabled={!newPost.trim()} className="btn-pill btn-pill-mint btn-pill-sm">
            <SendHorizonal size={13} />
            Publicar
          </button>
        </div>
      </form>

      {filtered.length === 0 ? (
        <div className="surface col-span-full flex flex-col items-center gap-4 py-14 text-center">
          <Elir size={72} mood="curious" />
          <p className="display max-w-sm text-xl leading-snug text-ink-800">
            Nadie ha escrito en esta categoría. ¿Y si tú abres la{' '}
            <span className="italic">conversación</span>?
          </p>
          <button
            type="button"
            onClick={() => setCategoryFilter('todas')}
            className="btn-pill btn-pill-paper btn-pill-sm"
          >
            Ver todas las publicaciones
          </button>
        </div>
      ) : (
        <motion.ul variants={cascade} initial="hidden" animate="show" className="space-y-4">
          <AnimatePresence initial={false}>
            {filtered.map((post) => (
              <motion.li key={post.id} layout variants={rise}>
                <article className="surface p-6">
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                        post.authorRole === 'instructor'
                          ? 'bg-ink-900 text-white'
                          : 'bg-canvas-deep text-ink-700 ring-1 ring-line-strong'
                      }`}>
                        {initialsOf(post.author)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold">{post.author}</p>
                        <p className="truncate text-xs font-semibold text-ink-400">{roleText(post)}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-canvas-deep px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-500 ring-1 ring-line">
                      {CATEGORY_LABELS[post.category]}
                    </span>
                  </header>

                  <p className="mt-3.5 text-sm leading-relaxed text-ink-700">{post.content}</p>

                  <footer className="mt-4 flex items-center gap-5 border-t border-line pt-3.5">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        post.likedByMe ? 'text-red-500' : 'text-ink-400 hover:text-ink-800'
                      }`}
                    >
                      <Heart size={14} fill={post.likedByMe ? 'currentColor' : 'none'} />
                      {post.likesCount}
                    </button>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-ink-400">
                      <MessageCircle size={14} />
                      {post.comments.length}
                    </span>
                  </footer>

                  {post.comments.length > 0 && (
                    <ul className="mt-4 space-y-3 border-l-2 border-line pl-4">
                      {post.comments.map((comment) => (
                        <li key={comment.id} className="text-xs leading-relaxed">
                          <strong className="font-extrabold text-ink-800">{comment.author}</strong>{' '}
                          <span className="text-ink-600">{comment.content}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form onSubmit={(e) => addComment(e, post.id)} className="mt-3.5 flex gap-2">
                    <input
                      value={drafts[post.id] ?? ''}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Escribe un comentario…"
                      className="input flex-1"
                    />
                    <button type="submit" aria-label="Enviar comentario" disabled={!drafts[post.id]?.trim()} className="btn-pill btn-pill-paper btn-pill-sm shrink-0">
                      <SendHorizonal size={13} />
                    </button>
                  </form>
                </article>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
};

const ComunicadosChannel = () => {
  const { terminology } = useInstitution();

  const sorted = useMemo(
    () => [...ANNOUNCEMENTS].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [],
  );

  const audienceLabel = (a: AnnouncementAudience) =>
    a.scope === 'institucion'
      ? 'Toda la institución'
      : `${terminology.group} ${a.groupCode}`;

  return (
    <motion.ul variants={cascade} initial="hidden" animate="show" className="space-y-4">
      {sorted.map((a) => (
        <motion.li key={a.id} variants={rise}>
          <article className="surface flex gap-4 p-5">
            <IconTile icon={Megaphone} variant={a.pinned ? 'ink' : 'paper'} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <h3 className="text-sm font-extrabold leading-snug tracking-tight">{a.title}</h3>
                {a.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
                    <Pin size={10} />
                    Fijado
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{a.body}</p>
              <footer className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-ink-400">
                <span className="font-bold text-ink-700">{a.issuer}</span>
                <span aria-hidden>·</span>
                <span className="rounded-full bg-mint-50 px-2 py-0.5 font-bold text-mint-700 ring-1 ring-mint-100">
                  {audienceLabel(a.audience)}
                </span>
                <span aria-hidden>·</span>
                <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
              </footer>
            </div>
          </article>
        </motion.li>
      ))}
    </motion.ul>
  );
};

const DocenteChannel = () => {
  const { terminology } = useInstitution();
  const [questions, setQuestions] = useState<TeacherQuestion[]>(INITIAL_TEACHER_QUESTIONS);
  const [draft, setDraft] = useState('');
  const [topic, setTopic] = useState('');

  const submitQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setQuestions((prev) => [
      {
        id: `tq-${Date.now()}`,
        studentName: 'Tú',
        mine: true,
        competency: topic.trim() || 'Tema general',
        question: draft.trim(),
        askedAt: new Date().toISOString().slice(0, 10),
        answer: null,
        answeredBy: null,
        answeredAt: null,
      },
      ...prev,
    ]);
    setDraft('');
    setTopic('');
  };

  return (
    <div className="space-y-6">
      <motion.div variants={rise} initial="hidden" animate="show" className="flex items-center gap-3">
        <Elir size={44} mood="thinking" />
        <p className="display max-w-md text-base leading-snug text-ink-700">
          Pregunta como si el examen dependiera de eso:{' '}
          <span className="italic">contexto primero, duda después.</span>
        </p>
      </motion.div>

      <motion.form variants={rise} initial="hidden" animate="show" onSubmit={submitQuestion} className="surface space-y-3 p-4">
        <div className="flex items-start gap-3">
          <IconTile icon={MessageSquareQuote} variant="paper" size="sm" />
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Escribe tu pregunta para el ${terminology.instructor.toLowerCase()}…`}
            rows={2}
            className="input flex-1 resize-none"
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Competencia o tema (opcional)"
            className="input w-full max-w-xs flex-1 sm:flex-none"
          />
          <button type="submit" disabled={!draft.trim()} className="btn-pill btn-pill-mint btn-pill-sm">
            <SendHorizonal size={13} />
            Enviar pregunta
          </button>
        </div>
      </motion.form>

      <motion.ul variants={cascade} initial="hidden" animate="show" className="space-y-4">
        {questions.map((q) => (
          <motion.li key={q.id} variants={rise}>
            <article className="surface space-y-3 p-6">
              <header className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                    q.mine ? 'bg-mint-500 text-white' : 'bg-canvas-deep text-ink-700 ring-1 ring-line-strong'
                  }`}>
                    {initialsOf(q.studentName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">{q.studentName}</p>
                    <p className="truncate text-[11px] font-semibold text-ink-400">
                      {formatDate(q.askedAt)} · {q.competency}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${
                  q.answer
                    ? 'bg-mint-50 text-mint-700 ring-mint-200'
                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                }`}>
                  {q.answer ? 'Respondida' : 'Pendiente'}
                </span>
              </header>

              <p className="border-l-2 border-line pl-3.5 text-sm font-semibold leading-relaxed text-ink-800">
                {q.question}
              </p>

              {q.answer ? (
                <div className="rounded-2xl border border-mint-200 bg-mint-50/60 px-4 py-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-mint-700">
                    Respuesta de {q.answeredBy}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{q.answer}</p>
                  <p className="mt-2 text-[11px] font-semibold text-ink-400">
                    Guardada el {formatDate(q.answeredAt ?? q.askedAt)} · disponible para consulta
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-line-strong px-4 py-3">
                  <p className="text-xs font-medium italic leading-relaxed text-ink-400">
                    Aún sin respuesta. Aparecerá aquí apenas el {terminology.instructor.toLowerCase()} conteste.
                  </p>
                </div>
              )}
            </article>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

export const ComunidadView = () => {
  const [channel, setChannel] = useState<ChannelId>('foro');

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
            Comunicación
          </p>
          <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
            La voz de la <span className="italic">comunidad</span>
          </h1>
        </div>
        <div className="flex w-fit gap-1.5 rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setChannel(ch.id)}
              className={`relative rounded-full px-4 py-2 text-xs transition-colors ${
                channel === ch.id
                  ? 'font-extrabold text-white'
                  : 'font-semibold text-ink-500 hover:text-ink-900'
              }`}
            >
              {channel === ch.id && (
                <motion.span
                  layoutId="comm-channel"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  className="absolute inset-0 rounded-full bg-ink-900"
                />
              )}
              <span className="relative z-10">{ch.label}</span>
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.section
          key={channel}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {channel === 'foro' && <ForoChannel />}
          {channel === 'comunicados' && <ComunicadosChannel />}
          {channel === 'docente' && <DocenteChannel />}
        </motion.section>
      </AnimatePresence>
    </div>
  );
};
