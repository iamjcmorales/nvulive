import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdSearch, MdFilterList, MdChatBubbleOutline, MdKeyboardBackspace } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { db } from '../../firebase/config'; // Importar db desde la configuración de Firebase
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import CreatePostWidget from '../widgets/CreatePostWidget'; // Importar el widget para crear posts

const PageContainer = styled.div`
  padding: 15px 20px 20px 20px;
  background-color: rgb(0,0,0);
  min-height: calc(100vh - 64px);
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const SideContent = styled.div`
  width: 350px;
  flex-shrink: 0;
  
  @media (max-width: 992px) {
    width: 100%;
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  background: none;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: rgb(255,255,255);
  margin: 0;
`;

const PostInput = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 20px;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  
  &::placeholder {
    color: #666;
  }
  
  &:focus {
    border-color: #0088cc;
  }
`;

const SubmitButton = styled.button`
  padding: 8px 16px;
  background-color: #1a1a2e;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  float: right;
  margin-top: 10px;
  cursor: pointer;
  
  &:hover {
    background-color: #0d0d1a;
  }
`;

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px; /* Aumentado el gap para más espacio entre cards */
`;

const PostCard = styled.div`
  background: rgb(24,24,24);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  padding: 20px;
  margin-bottom: 20px;
  color: rgb(255,255,255);
  border: 1px solid rgba(0,150,136,0.08);
`;

const PostContent = styled.div`
  padding: 20px 24px; /* Aumentado padding */
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px; /* Ajustado margen */
`;

const AuthorAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #e9ecef; /* Color de fondo más neutro */
  margin-right: 12px; /* Ajustado margen */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600; /* Letra un poco más marcada */
  color: #495057;   /* Color de letra más oscuro */
  font-size: 18px;
  border: 2px solid #f8f9fa; /* Borde sutil */
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: 600;
  font-size: 1em;
  color: rgb(0,150,136);
  line-height: 1.3;
`;

const PostTime = styled.span`
  font-size: 0.85em;
  color: rgb(158,158,158);
`;

const PostTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 12px;
  font-weight: 600;
  color: rgb(255,255,255);
  line-height: 1.4;
`;

const PostImage = styled.div`
  width: 100%;
  max-height: 450px;
  background-color: rgb(24,24,24);
  margin-top: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: cover;
    display: block;
    border-radius: 8px;
  }
`;

const PostTextContent = styled.p`
  font-size: 1em;
  color: rgb(158,158,158);
  margin-bottom: 0.5em;
`;

const PostFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: rgb(24,24,24);
  border-top: 1px solid rgb(30,30,30);
`;

const CommentCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px; /* Espacio entre icono y texto */
  color: #6c757d;
  font-size: 0.9em;

  svg {
    vertical-align: middle; /* Mejor alineación del icono */
    font-size: 1.1em; /* Icono ligeramente más grande */
  }
`;

const ViewDetailsButton = styled.button`
  padding: 8px 16px; /* Padding ajustado */
  font-size: 0.9em;
  color: #007bff;
  background-color: transparent;
  border: 1px solid #007bff;
  border-radius: 6px; /* Bordes más redondeados */
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  &:active {
    transform: translateY(1px);
    background-color: #0056b3;
    border-color: #0056b3;
  }
`;

const SidebarCard = styled.div`
  background-color: rgb(24,24,24);
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.18);
  padding: 15px;
  margin-bottom: 20px;
`;

const SidebarTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 600;
  color: rgb(0,150,136);
`;

const NewsItem = styled.div`
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const NewsImage = styled.div`
  width: 100%;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NewsTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
  color: rgb(255,255,255);
`;

const NewsContent = styled.p`
  font-size: 14px;
  color: rgb(158,158,158);
  line-height: 1.4;
`;

const NewsTime = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgb(158,158,158);
  margin-top: 5px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #6c757d; /* Color ajustado */
  font-size: 1em; /* Tamaño ajustado */
  cursor: pointer;
  padding: 8px 0; /* Añadido padding para mejor click target */
  margin-bottom: 20px; /* Espacio aumentado */
  
  &:hover {
    color: #007bff;
  }

  svg {
    font-size: 1.2em;
  }
`;

const ClickablePostCard = styled(PostCard)`
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 16px rgba(0,150,136,0.18);
    border-color: rgb(0,150,136,0.18);
  }
`;

// --- Comments Section ---
const CommentsSection = styled.div`
  background: rgb(24,24,24);
  border-radius: 10px;
  margin-top: 24px;
  padding: 20px;
`;
const CommentTitle = styled.h3`
  color: rgb(0,150,136);
  font-size: 18px;
  margin-bottom: 16px;
`;
const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const CommentItem = styled.div`
  background: rgb(18,18,18);
  border-radius: 8px;
  padding: 12px 14px;
  color: rgb(255,255,255);
  font-size: 15px;
`;
const CommentForm = styled.form`
  display: flex;
  gap: 10px;
  margin-top: 16px;
`;
const CommentInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgb(40,40,40);
  background: rgb(24,24,24);
  color: rgb(255,255,255);
  font-size: 15px;
  outline: none;
`;
const CommentButton = styled.button`
  background: rgb(0,150,136);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: rgb(0,200,180); color: rgb(0,0,0); }
`;

const ImageModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalImage = styled.img`
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.4);
`;
const CloseModalButton = styled.button`
  position: absolute;
  top: 32px;
  right: 32px;
  background: rgb(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.7rem;
  cursor: pointer;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover { background: rgb(0,150,136,0.8); color: rgb(0,0,0); }
`;

// Componente de detalle del post
const PostDetail = ({ post, onBack }) => {
  const { t } = useTranslation();
  const [comments, setComments] = React.useState([]);
  const [commentText, setCommentText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

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
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      await addDoc(commentsRef, {
        text: commentText,
        author: 'Usuario', // Puedes reemplazar por el usuario real si tienes auth
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (err) {
      alert('Error al enviar el comentario');
    }
    setIsSubmitting(false);
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return t('forum.post.dateUnavailable');
  };

  if (!post) return null;

  return (
    <PostCard>
      <PostContent>
        <BackButton onClick={onBack}>
          <MdKeyboardBackspace /> {t('forum.backButton', 'Volver al foro')}
        </BackButton>
        <PostTitle>{post.title}</PostTitle>
        <PostHeader>
          <AuthorAvatar>
            {post.author ? post.author.charAt(0).toUpperCase() : 'U'}
          </AuthorAvatar>
          <AuthorInfo>
            <AuthorName>{post.author || t('forum.post.anonymous')}</AuthorName>
            <PostTime>{formatTimestamp(post.createdAt)}</PostTime>
          </AuthorInfo>
        </PostHeader>
        <PostTextContent>{post.content}</PostTextContent>
        {post.imageUrl && (
          <PostImage>
            <img 
              src={post.imageUrl} 
              alt={post.title || t('forum.post.imageAlt', 'Imagen del post')} 
              style={{cursor:'zoom-in'}}
              onClick={() => setModalOpen(true)}
            />
          </PostImage>
        )}
      </PostContent>
      <PostFooter>
        <CommentCount>
          <MdChatBubbleOutline /> {comments.length} {t('forum.post.comments')}
        </CommentCount>
      </PostFooter>
      <CommentsSection>
        <CommentTitle>{t('forum.commentsTitle', 'Comentarios')}</CommentTitle>
        <CommentList>
          {comments.length === 0 && <span style={{color:'rgb(158,158,158)'}}>{t('forum.noComments','Sin comentarios aún.')}</span>}
          {comments.map(comment => (
            <CommentItem key={comment.id}>
              <b style={{color:'rgb(0,150,136)'}}>{comment.author || 'Usuario'}:</b> {comment.text}
              <div style={{fontSize:'12px',color:'rgb(158,158,158)',marginTop:'2px'}}>{formatTimestamp(comment.createdAt)}</div>
            </CommentItem>
          ))}
        </CommentList>
        <CommentForm onSubmit={handleCommentSubmit}>
          <CommentInput
            type="text"
            placeholder={t('forum.addComment','Escribe un comentario...')}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            disabled={isSubmitting}
          />
          <CommentButton type="submit" disabled={isSubmitting || !commentText.trim()}>
            {t('forum.send','Enviar')}
          </CommentButton>
        </CommentForm>
      </CommentsSection>
      {modalOpen && (
        <ImageModalOverlay onClick={() => setModalOpen(false)}>
          <CloseModalButton onClick={e => { e.stopPropagation(); setModalOpen(false); }} title="Cerrar">&times;</CloseModalButton>
          <ModalImage src={post.imageUrl} alt={post.title || t('forum.post.imageAlt', 'Imagen del post')} />
        </ImageModalOverlay>
      )}
    </PostCard>
  );
};

const Forum = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching posts: ", err);
      setError(t('forum.loadError'));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [t]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleBackToForum = () => {
    setSelectedPost(null);
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return t('forum.post.dateUnavailable');
  };

  if (isLoading) {
    return <PageContainer><p>{t('forum.loadingPosts')}</p></PageContainer>;
  }

  if (error) {
    return <PageContainer><p>{error}</p></PageContainer>;
  }

  if (selectedPost) {
    return (
      <PageContainer>
         <PageHeader>
            <PageTitle>{t('forum.postDetailTitle', 'Detalle del Post')}</PageTitle>
        </PageHeader>
        <PostDetail post={selectedPost} onBack={handleBackToForum} />
      </PageContainer>
    );
  }

  // Cambiar el placeholder de trending topics
  const trendingTopics = [
    'Estrategias de Trading',
    'Análisis Técnico',
    'Gestión de Riesgo',
    'Psicología del Trading',
    'Noticias del Mercado',
  ];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>NVU Forex News</PageTitle>
      </PageHeader>

      <ContentContainer>
        <MainContent>
          <CreatePostWidget />
          
          <FeedContainer>
            {posts.length === 0 && !isLoading ? (
              <p>{t('forum.noPosts')}</p>
            ) : (
              posts.map(post => (
                <ClickablePostCard key={post.id} onClick={() => handlePostClick(post)}>
                  <PostContent>
                    <PostTitle>{post.title}</PostTitle>
                    <PostHeader>
                      <AuthorAvatar>
                        {post.author ? post.author.charAt(0).toUpperCase() : 'U'} 
                      </AuthorAvatar>
                      <AuthorInfo>
                        <AuthorName>{post.author || t('forum.post.anonymous')}</AuthorName>
                        <PostTime>{formatTimestamp(post.createdAt)}</PostTime>
                      </AuthorInfo>
                    </PostHeader>
                    <PostTextContent>
                      {post.content.substring(0, 250)}{post.content.length > 250 ? '...' : ''}
                    </PostTextContent>
                    {post.imageUrl && (
                      <PostImage>
                        <img src={post.imageUrl} alt={post.title || t('forum.post.imageAlt', 'Imagen del post')} />
                      </PostImage>
                    )}
                  </PostContent>
                  <PostFooter>
                    <CommentCount>
                      <MdChatBubbleOutline /> {post.commentsCount || 0} Comentarios
                    </CommentCount>
                  </PostFooter>
                </ClickablePostCard>
              ))
            )}
          </FeedContainer>
        </MainContent>

        <SideContent>
          <SidebarCard>
            <SidebarTitle>Tendencias del Foro</SidebarTitle>
            <ul style={{paddingLeft: 18, color: 'rgb(200,200,200)', margin: 0}}>
              {trendingTopics.map((topic, idx) => (
                <li key={idx} style={{marginBottom: 8}}>{topic}</li>
              ))}
            </ul>
          </SidebarCard>
        </SideContent>
      </ContentContainer>
    </PageContainer>
  );
};

export default Forum;