import React, { useState } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config'; // Solo necesitamos db, no storage
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// Ya no necesitamos ref, uploadBytesResumable, getDownloadURL de firebase/storage
import { useTranslation } from 'react-i18next';

const WidgetContainer = styled.div`
  padding: 28px 24px 24px 24px;
  background-color: #111;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 255, 255, 0.04);
  margin-bottom: 32px;
  border: 1.5px solid rgba(0,255,255,0.08);
`;

const WidgetTitle = styled.h3`
  font-size: 22px;
  color: #fff;
  margin-bottom: 22px;
  font-weight: 700;
  letter-spacing: 0.01em;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 15px;
  color: #b0b0b0;
  margin-bottom: 7px;
  font-weight: 500;
`;

const BaseInputStyles = `
  width: 100%;
  padding: 13px 16px;
  margin-bottom: 18px;
  border: 1.5px solid #23272a;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 16px;
  color: #fff;
  background: #181a1b;
  transition: border-color 0.2s, box-shadow 0.2s;

  &::placeholder {
    color: #888;
    opacity: 1;
  }

  &:focus {
    outline: none;
    border-color: #00fff7;
    box-shadow: 0 0 0 2px rgba(0,255,255,0.12);
  }
`;

const TitleInput = styled.input`
  ${BaseInputStyles}
`;

const ContentTextarea = styled.textarea`
  ${BaseInputStyles}
  min-height: 120px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  padding: 13px 28px;
  background: linear-gradient(90deg, #00fff7 0%, #00bcd4 100%);
  color: #111;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 17px;
  font-weight: 700;
  margin-top: 6px;
  box-shadow: 0 2px 8px rgba(0,255,255,0.08);
  transition: background 0.2s, color 0.2s, transform 0.1s;

  &:hover {
    background: linear-gradient(90deg, #00e6e0 0%, #00acc1 100%);
    color: #000;
  }
  &:active {
    background: #00bcd4;
    color: #000;
    transform: translateY(1px);
  }
  &:disabled {
    background: #222;
    color: #888;
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4d4f;
  font-size: 15px;
  margin-top: -8px;
  margin-bottom: 14px;
`;

// Nuevo styled component para el input de la URL de imagen, similar a TitleInput
const ImageUrlInput = styled.input`
  ${BaseInputStyles}
`;

const CreatePostWidget = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const userName = localStorage.getItem('userName') || '';
    if (!title.trim() || !content.trim() || !userName.trim()) {
      setError(t('forum.createPost.errorEmptyFields', 'Por favor completa todos los campos requeridos'));
      return;
    }
    if (imageUrl.trim() && !imageUrl.trim().match(/^https?:\/\/.+\.(jpg|jpeg|png|gif)(\?.*)?$/i)) {
      setError(t('forum.createPost.errorInvalidImageUrl', 'La URL de la imagen no es válida. Debe ser un enlace directo a una imagen (JPG, PNG o GIF)'));
      return;
    }
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        content: content.trim(),
        author: userName.trim(),
        imageUrl: imageUrl.trim(),
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
      setImageUrl('');
      alert(t('forum.createPost.success', '¡Post publicado exitosamente!'));
    } catch (err) {
      console.error('Error creating post: ', err);
      setError(t('forum.createPost.errorGeneral', 'Hubo un error al publicar el post. Por favor intenta nuevamente.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WidgetContainer>
      <WidgetTitle>{t('forum.createPost.title', 'Crear Nueva Publicación')}</WidgetTitle>
      <form onSubmit={handleSubmit}>
        <div>
          <InputLabel htmlFor="postTitle">{t('forum.createPost.titleLabel', 'Título de la Publicación')}</InputLabel>
          <TitleInput
            id="postTitle"
            type="text"
            placeholder={t('forum.createPost.titlePlaceholder', 'Escribe un título llamativo para tu publicación...')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <InputLabel htmlFor="postContent">{t('forum.createPost.contentLabel', 'Contenido de la Publicación')}</InputLabel>
          <ContentTextarea
            id="postContent"
            placeholder={t('forum.createPost.contentPlaceholder', 'Comparte tus ideas, análisis, preguntas o experiencias sobre trading...')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <InputLabel htmlFor="postImageUrl">{t('forum.createPost.imageUrlLabel', 'Imagen de la Publicación (opcional)')}</InputLabel>
          <ImageUrlInput
            id="postImageUrl"
            type="url"
            placeholder={t('forum.createPost.imageUrlPlaceholder', 'Pega aquí la URL de una imagen (gráficos, capturas, etc.)')}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? t('forum.createPost.creating', 'Publicando...') : t('forum.createPost.submit', 'Publicar')}
        </SubmitButton>
      </form>
    </WidgetContainer>
  );
};

export default CreatePostWidget; 