import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdChatBubbleOutline, MdKeyboardBackspace, MdThumbUp } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import CreatePostWidget from '../widgets/CreatePostWidget';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 40px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 32px;
  position: relative;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 8px;
  }
`;
const Container = styled.div`
  padding: 32px 0;
  max-width: 100%;
  @media (max-width: 900px) {
    padding: 18px 0;
  }
`;
const SidebarTrends = styled.aside`
  position: sticky;
  top: 100px;
  height: fit-content;
  background: #181c1b;
  border-radius: 12px;
  padding: 32px 24px;
  color: #fff;
  margin-top: 32px;
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
  color: #00e6e6;
  font-size: 1.2em;
  margin-bottom: 24px;
  font-weight: 600;
`;
const TrendsList = styled.ul`
  padding-left: 18px;
  margin: 0 0 32px 0;
  list-style-type: none;
  
  li {
    margin-bottom: 12px;
    color: rgb(200,200,200);
    font-size: 0.95em;
    transition: color 0.2s;
    
    &:hover {
      color: rgb(0,150,136);
    }
  }
`;
const PostCard = styled.div`
  background: rgb(24,24,24);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  padding: 24px;
  margin-bottom: 32px;
  color: rgb(255,255,255);
  border: 1px solid rgba(0,150,136,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  @media (max-width: 900px) {
    padding: 14px;
    margin-bottom: 18px;
  }
`;
const PostContent = styled.div`
  padding: 24px 32px;
  @media (max-width: 900px) {
    padding: 10px 4px;
  }
`;
const PostHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;
const AuthorAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #e9ecef;
  margin-right: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #495057;
  font-size: 18px;
  border: 2px solid #f8f9fa;
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
const PostTextContent = styled.p`
  font-size: 1em;
  color: rgb(158,158,158);
  margin-bottom: 0.5em;
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
  @media (max-width: 900px) {
    max-height: 220px;
    img { max-height: 220px; }
  }
`;

// Nuevos estilos para el carrusel de anuncios
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

const Markups = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  // Obtener el usuario actual
  const userData = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('nvuUserData')) || null;
    } catch {
      return null;
    }
  }, []);
  const userId = userData?.id;

  // Datos de ejemplo para los anuncios
  const ads = [
    {
      id: 1,
      image: 'https://picsum.photos/seed/ad1/400/300',
      text: 'Aprende Trading con los Mejores Educadores'
    },
    {
      id: 2,
      image: 'https://picsum.photos/seed/ad2/400/300',
      text: 'Únete a Nuestra Comunidad de Traders'
    },
    {
      id: 3,
      image: 'https://picsum.photos/seed/ad3/400/300',
      text: 'Estrategias Avanzadas de Trading'
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

  const handlePostClick = (post) => setSelectedPost(post);
  const handleBackToMarkups = () => setSelectedPost(null);
  const handleCreatePost = () => setShowCreatePost(true);
  const handleCloseCreatePost = () => setShowCreatePost(false);

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return t('forum.post.dateUnavailable');
  };

  if (isLoading) return <Container>Cargando...</Container>;
  if (error) return <Container>{error}</Container>;

  if (selectedPost) {
    return (
      <Layout>
        <Container>
          <h1>Markups</h1>
          <PostCard>
            <PostContent>
              <PostTitle>{selectedPost.title}</PostTitle>
              <PostHeader>
                <AuthorAvatar>
                  {selectedPost.author ? selectedPost.author.charAt(0).toUpperCase() : 'U'}
                </AuthorAvatar>
                <AuthorInfo>
                  <AuthorName>{selectedPost.author || t('forum.post.anonymous')}</AuthorName>
                  <PostTime>{formatTimestamp(selectedPost.createdAt)}</PostTime>
                </AuthorInfo>
              </PostHeader>
              <PostTextContent>{selectedPost.content}</PostTextContent>
              {selectedPost.imageUrl && (
                <PostImage>
                  <img src={selectedPost.imageUrl} alt={selectedPost.title || 'Imagen del post'} />
                </PostImage>
              )}
            </PostContent>
          </PostCard>
          <button onClick={handleBackToMarkups}>Volver</button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <h1>Markups</h1>
        {userId === 1029917 && (
        <button onClick={handleCreatePost}>Crear Post</button>
        )}
        {userId === 1029917 && showCreatePost && (
          <CreatePostWidget onClose={handleCloseCreatePost} />
        )}
        {posts.map(post => (
          <PostCard key={post.id} onClick={() => handlePostClick(post)} style={{cursor:'pointer'}}>
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
                  <img src={post.imageUrl} alt={post.title || 'Imagen del post'} />
                </PostImage>
              )}
            </PostContent>
            {/* Pie de post: like y comentar */}
            <div style={{display:'flex', gap:24, alignItems:'center', padding:'0 32px 16px 32px'}}>
              <span style={{display:'flex',alignItems:'center',gap:6,color:'#6c757d',fontSize:'1.1em'}}><MdThumbUp/> 0</span>
              <span style={{display:'flex',alignItems:'center',gap:6,color:'#6c757d',fontSize:'1.1em'}}><MdChatBubbleOutline/> 0</span>
            </div>
          </PostCard>
        ))}
      </Container>
    </Layout>
  );
};

export default Markups; 