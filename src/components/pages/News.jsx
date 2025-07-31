import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdChatBubbleOutline, MdKeyboardBackspace, MdThumbUp } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getCountFromServer, deleteDoc, doc } from 'firebase/firestore';
import CreatePostWidget from '../widgets/CreatePostWidget';

const FuturisticBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  background: linear-gradient(120deg, #0f2027 0%, #2c5364 100%);
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(0,255,255,0.08) 0, transparent 60%),
                radial-gradient(circle at 80% 70%, rgba(255,0,255,0.08) 0, transparent 60%);
    z-index: 1;
    pointer-events: none;
  }
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
`;

const Container = styled.div`
  padding: 32px 0 0 0;
  max-width: 100%;
  @media (max-width: 900px) {
    padding: 18px 0 0 0;
  }
  @media (max-width: 768px) {
    padding-left: 15px;
    padding-right: 15px;
  }
`;

const SidebarTrends = styled.aside`
  position: sticky;
  top: 100px;
  height: fit-content;
  background: rgba(24,28,36,0.7);
  border-radius: 18px;
  padding: 32px 24px;
  color: #fff;
  margin-top: 32px;
  box-shadow: 0 0 24px 2px #00fff7a0;
  border: 1.5px solid #00fff7;
  backdrop-filter: blur(8px);
  @media (max-width: 1200px) {
    display: none;
  }
  @media (max-width: 900px) {
    display: block;
    position: static;
    margin-top: 0;
    margin-bottom: 24px;
    padding: 18px 10px;
  }
`;

const TrendsTitle = styled.h3`
  background: linear-gradient(90deg, #00fff7 0%, #a259ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.3em;
  margin-bottom: 24px;
  font-weight: 700;
  letter-spacing: 1px;
`;

const TrendsList = styled.ul`
  padding-left: 18px;
  margin: 0 0 32px 0;
  list-style-type: none;
  li {
    margin-bottom: 12px;
    color: #b2fefa;
    font-size: 1em;
    transition: color 0.2s;
    text-shadow: 0 0 6px #00fff7a0;
    &:hover {
      color: #fff;
      text-shadow: 0 0 12px #00fff7;
    }
  }
`;

const PostRow = styled.div`
  display: flex;
  align-items: stretch;
  background: #23272a;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 32px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  height: 180px;
  min-height: 180px;
  max-height: 180px;
  &:hover {
    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
    transform: translateY(-2px) scale(1.01);
  }
  @media (max-width: 900px) {
    flex-direction: column;
    border-radius: 18px;
    height: auto;
    min-height: unset;
    max-height: unset;
    margin-bottom: 18px;
  }
`;

const PostLeft = styled.div`
  min-width: 320px;
  max-width: 320px;
  background: #fff;
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0;
  height: 100%;
  overflow: hidden;
  @media (max-width: 900px) {
    min-width: 100%;
    max-width: 100%;
    height: 180px;
    aspect-ratio: unset;
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  background: #f5f5f5;
  @media (max-width: 900px) {
    height: 180px;
    min-height: 120px;
    max-height: 220px;
  }
`;

const PostCenter = styled.div`
  flex: 1;
  padding: 10px 8px 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  @media (max-width: 900px) {
    padding: 8px 4px 4px 4px;
  }
`;

const PostTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
`;

const ChipsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const Chip = styled.span`
  background: #e0e0e0;
  color: #23272a;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 18px;
  padding: 4px 12px;
  display: inline-block;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

const AuthorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d8d8d8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #23272a;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
`;

const PostDate = styled.span`
  color: #b0b0b0;
  font-size: 0.85rem;
`;

const PostRight = styled.div`
  min-width: 100px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 0 16px 16px 0;
  @media (max-width: 900px) {
    min-width: 100%;
    justify-content: flex-start;
    padding: 0 0 12px 12px;
  }
`;

const CommentsCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #23272a;
  background: #fff;
  border-radius: 18px;
  padding: 6px 12px;
  font-size: 0.95rem;
  font-weight: 500;
`;

// Estilos para el carrusel de anuncios
const AdCarousel = styled.div`
  margin-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 32px;
`;

const AdTitle = styled.h3`
  color: #00e6e6;
  font-size: 1.2em;
  margin-bottom: 24px;
  font-weight: 600;
  text-align: center;
`;

const AdContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const AdCard = styled.div`
  background: rgb(24,24,24);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const AdImage = styled.img`
  width: 100%;
  height: 240px;
  object-fit: cover;
  @media (max-width: 900px) {
    height: 120px;
  }
`;

const AdContent = styled.div`
  padding: 20px;
  text-align: center;
`;

const AdText = styled.p`
  color: rgb(255,255,255);
  font-size: 1.1em;
  margin: 0;
  line-height: 1.4;
  font-weight: 500;
`;

const JournalSection = styled.div`
  margin-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 32px;
`;

const JournalTitle = styled.h3`
  color: #00e6e6;
  font-size: 1.2em;
  margin-bottom: 16px;
  font-weight: 600;
`;

const JournalDescription = styled.p`
  color: rgb(158,158,158);
  font-size: 0.95em;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const JournalButton = styled.button`
  background: linear-gradient(90deg, #00fff7 0%, #a259ff 100%);
  color: #181c1b;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1em;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 0 16px 2px #00fff7a0;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  &:hover {
    background: linear-gradient(90deg, #a259ff 0%, #00fff7 100%);
    color: #fff;
    box-shadow: 0 0 32px 4px #a259ffb0;
  }
`;

const DetailCard = styled.div`
  background: #fff;
  color: #23272a;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  padding: 32px 24px;
  margin: 32px auto;
  max-width: 700px;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: rgb(0,150,136);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0,150,136,0.1);
    transform: scale(1.1);
  }
`;

const DetailTitle = styled.h1`
  color: #fff;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
`;

const DetailContent = styled.div`
  color: rgb(200,200,200);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const DetailImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const CommentsSection = styled.div`
  background: #f5f5f5;
  border-radius: 12px;
  margin-top: 32px;
  padding: 24px 18px;
  color: #23272a;
`;

const CommentTitle = styled.h3`
  color: #00bcd4;
  font-size: 1.15rem;
  margin-bottom: 16px;
  font-weight: 700;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentItem = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 12px 14px;
  color: #23272a;
  font-size: 15px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  margin-bottom: 4px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #b0b0b0;
  background: #f5f5f5;
  color: #23272a;
  font-size: 15px;
  outline: none;
`;

const CommentButton = styled.button`
  background: #00bcd4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  margin-left: 8px;
  transition: background 0.2s;
  &:hover { background: #0097a7; color: #fff; }
`;

const CommentActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 6px;
`;

// Utilidad para mostrar tiempo relativo
function timeAgo(date, t) {
  if (!date) return '';
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return t('common.timeAgo', { time: interval + ' año' + (interval > 1 ? 's' : '') });
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return t('common.timeAgo', { time: interval + ' mes' + (interval > 1 ? 'es' : '') });
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return t('common.timeAgo', { time: interval + ' día' + (interval > 1 ? 's' : '') });
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return t('common.timeAgo', { time: interval + ' hora' + (interval > 1 ? 's' : '') });
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return t('common.timeAgo', { time: interval + ' minuto' + (interval > 1 ? 's' : '') });
  return t('common.timeAgo', { time: 'unos segundos' });
}

const PostDetail = ({ post, onBack, t, ads }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [commentCounts, setCommentCounts] = useState({});
  const userData = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('nvuUserData')) || {};
    } catch {
      return {};
    }
  }, []);

  React.useEffect(() => {
    if (!post?.id) return;
    const commentsRef = collection(db, 'posts', post.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [post?.id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      await addDoc(commentsRef, {
        text: newComment,
        author: userData.name || 'Usuario',
        authorId: userData.id || '',
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (err) {
      alert('Error al enviar el comentario');
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
  };

  const handleSaveEdit = async (comment) => {
    if (!newComment.trim()) return;
    try {
      // Aquí deberías usar updateDoc, pero para que todos puedan comentar y editar solo lo propio, puedes dejarlo así o mejorar luego
    } catch (err) {
      alert('Error al editar el comentario');
    }
    setEditingComment(null);
    setNewComment("");
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;
    try {
      const commentRef = collection(db, 'posts', post.id, 'comments');
      await deleteDoc(doc(commentRef, commentId));
    } catch (err) {
      alert('Error al eliminar el comentario');
    }
  };

  const formatCommentTime = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timeAgo(timestamp.toDate(), t);
    }
    return '';
  };

  if (!post || !post.title) {
    return (
      <Container>
        <div style={{color: 'white', padding: 40, textAlign: 'center'}}>
          {t('news.errorPostData', 'No se pudo cargar la información del post.')}
          <br />
          <button onClick={onBack} style={{marginTop: 24, background:'#181c1b',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,cursor:'pointer'}}>
            {t('news.backButton')}
          </button>
        </div>
      </Container>
    );
  }

  return (
    <div>
      <DetailCard>
        <DetailHeader>
          <BackButton onClick={onBack}>
            <MdKeyboardBackspace />
          </BackButton>
          <DetailTitle>{post.title}</DetailTitle>
        </DetailHeader>
        
        {post.imageUrl && <DetailImage src={post.imageUrl} alt={post.title} />}
        
        <DetailContent>
          {post.content}
        </DetailContent>

        {/* Comments section */}
        <CommentsSection>
          <CommentTitle>{t('forum.commentsTitle', 'Comentarios')}</CommentTitle>
          <CommentList>
            {comments.length === 0 && <span style={{color:'#b0b0b0'}}>{t('forum.noComments','Sin comentarios aún.')}</span>}
            {comments.map(comment => (
              <CommentItem key={comment.id}>
                <CommentMeta>
                  <b style={{color:'#00fff7'}}>{comment.author || 'Usuario'}:</b>
                  <span>{formatCommentTime(comment.createdAt)}</span>
                  {comment.editedAt && <span style={{fontStyle:'italic',color:'#a259ff'}}>{t('forum.edited','editado')}</span>}
                </CommentMeta>
                {editingComment === comment.id ? (
                  <>
                    <CommentInput
                      type="text"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      disabled={false}
                    />
                    <CommentButton type="button" onClick={() => handleSaveEdit(comment)} disabled={false}>
                      {t('forum.save','Guardar')}
                    </CommentButton>
                    <CommentButton type="button" onClick={() => { setEditingComment(null); setNewComment(""); }}>
                      {t('forum.cancel','Cancelar')}
                    </CommentButton>
                  </>
                ) : (
                  <span>{comment.text}</span>
                )}
                {comment.authorId === userData.id && editingComment !== comment.id && (
                  <CommentActions>
                    <CommentButton type="button" onClick={() => handleEditComment(comment)}>{t('forum.edit','Editar')}</CommentButton>
                    <CommentButton type="button" onClick={() => handleDeleteComment(comment.id)}>{t('forum.delete','Eliminar')}</CommentButton>
                  </CommentActions>
                )}
              </CommentItem>
            ))}
          </CommentList>
          <CommentForm onSubmit={handleCommentSubmit}>
            <CommentInput
              type="text"
              placeholder={t('forum.addComment','Escribe un comentario...')}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              disabled={false}
              required
            />
            <CommentButton type="submit" disabled={false}>
              {t('forum.send','Enviar')}
            </CommentButton>
          </CommentForm>
        </CommentsSection>
      </DetailCard>
    </div>
  );
};

const MAX_WIDTH = '1400px';

const NewsBanner = styled.div`
  width: 100%;
  max-width: ${MAX_WIDTH};
  height: 180px;
  background: url(${props => props.$bannerUrl}) center/cover no-repeat;
  display: block;
  margin: 0 auto 0 auto;
  border-radius: 18px;
  overflow: hidden;
`;

const NewsMainWrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 0;
`;

const BannerWrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  height: 180px;
  background: url('${props => props.image}') center/cover no-repeat;
  display: block;
  margin: 0 auto 24px auto;
  border-radius: 18px;
  overflow: hidden;
  @media (max-width: 768px) {
    height: 90px;
    border-radius: 12px;
    margin-bottom: 14px;
  }
`;

const News = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentsCounts, setCommentsCounts] = useState({});
  // Obtener el usuario actual
  const userData = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('nvuUserData')) || null;
    } catch {
      return null;
    }
  }, []);
  const userId = userData?.id;

  // Banner principal según idioma
  const mainBannerUrl = i18n.language.startsWith('es')
    ? '/images/Banner 4.jpg'
    : '/images/Banner 4 English.jpg';

  // Datos de ejemplo para los anuncios
  const ads = [
    {
      id: 1,
      image: 'https://picsum.photos/seed/news1/400/300',
      text: t('news.ads.news')
    },
    {
      id: 2,
      image: 'https://picsum.photos/seed/news2/400/300',
      text: t('news.ads.analysis')
    },
    {
      id: 3,
      image: 'https://picsum.photos/seed/news3/400/300',
      text: t('news.ads.strategies')
    }
  ];

  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setIsLoading(false);
    }, (err) => {
      setError(t('forum.loadError'));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [t]);

  useEffect(() => {
    if (posts.length === 0) return;
    const fetchCounts = async () => {
      const counts = {};
      for (const post of posts) {
        if (!post.id) continue;
        const commentsRef = collection(db, 'posts', post.id, 'comments');
        const snapshot = await getCountFromServer(commentsRef);
        counts[post.id] = snapshot.data().count || 0;
      }
      setCommentsCounts(counts);
    };
    fetchCounts();
  }, [posts]);

  const handlePostClick = (post) => setSelectedPost(post);
  const handleBackToNews = () => setSelectedPost(null);
  const handleCreatePost = () => setShowCreatePost(true);
  const handleCloseCreatePost = () => setShowCreatePost(false);

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timeAgo(timestamp.toDate(), t);
    }
    return t('forum.post.dateUnavailable');
  };

  if (isLoading) return <Container>{t('common.loading')}</Container>;
  if (error) return <Container>{error}</Container>;

  if (selectedPost) {
    return <PostDetail post={selectedPost} onBack={handleBackToNews} t={t} ads={ads} />;
  }

    return (
    <>
      <FuturisticBackground />
      <Layout>
        <BannerWrapper image={mainBannerUrl} />
        <NewsMainWrapper>
          <Container style={{paddingTop: 0}}>
          <h1>{t('news.title')}</h1>
            {userId === 1029917 && (
            <button onClick={handleCreatePost}>{t('news.createPostButton')}</button>
            )}
            {userId === 1029917 && showCreatePost && (
              <CreatePostWidget onClose={handleCloseCreatePost} />
            )}
            {posts.map(post => (
              <PostRow key={post.id} onClick={() => handlePostClick(post)}>
                <PostLeft>
                  {post.imageUrl ? (
                    <PostImage src={post.imageUrl} alt={post.title || 'Imagen del post'} />
                  ) : (
                    <PostImage src={'/images/placeholder.jpg'} alt="placeholder" />
                  )}
                </PostLeft>
                <PostCenter>
                  <PostTitle>{post.title}</PostTitle>
                  <ChipsRow>
                    {(post.tags && post.tags.length > 0 ? post.tags : ['General']).map((tag, idx) => (
                      <Chip key={idx}>{tag}</Chip>
                    ))}
                  </ChipsRow>
                  <AuthorRow>
                <AuthorAvatar>
                      {post.author ? post.author.charAt(0).toUpperCase() : 'U'}
                </AuthorAvatar>
                <AuthorInfo>
                      <AuthorName>{post.author || t('forum.post.anonymous')}</AuthorName>
                      <PostDate>{post.createdAt ? formatTimestamp(post.createdAt) : ''}</PostDate>
                </AuthorInfo>
                  </AuthorRow>
                </PostCenter>
                <PostRight>
                  <CommentsCount>
                    <MdChatBubbleOutline style={{fontSize:'1.3em'}} />
                    {commentsCounts[post.id] !== undefined ? `${commentsCounts[post.id]} comentario${commentsCounts[post.id] === 1 ? '' : 's'}` : '-'}
                  </CommentsCount>
                </PostRight>
              </PostRow>
            ))}
        </Container>
        </NewsMainWrapper>
      </Layout>
    </>
  );
};

export default News; 