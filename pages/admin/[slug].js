import styles from '@styles/Admin.module.css';
import AuthCheck from '@components/AuthCheck';
import { firestore, auth } from '@lib/firebase';
import ImageUploader from '@components/ImageUploader';

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useForm, useFormState } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { collection, doc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";

export default function AdminPostEdit(props) {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = doc(collection(firestore, "users", auth.currentUser.uid, "posts"), slug);
  // TODO Look into using useDocumentDataOnce since we only need original data on initial load
  const [post] = useDocumentDataOnce(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} defaultValues={post} preview={preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link legacyBehavior href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ defaultValues, postRef, preview }) {
  const { register, handleSubmit, reset, watch, formState: { errors }, control } = useForm({ defaultValues, mode: 'onChange' });

  const { isValid, isDirty } = useFormState({
    control
  });

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />

        <textarea
          {...register("content", {
            maxLength: { value: 20000, message: 'content is too long' },
            minLength: { value: 10, message: 'content is too short' },
            required: { value: true, message: 'content is required' },
          })}
        ></textarea>

        {errors.content && <p className="text-danger">{errors.content.message}</p>}

        <fieldset>
          <input className={styles.checkbox} type="checkbox" {...register("published")} />
          <label>Published</label>
        </fieldset>

        <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
          Save Changes
        </button>
      </div>
    </form>
  );
}

function DeletePostButton({ postRef }) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      // TODO firebase docs mention that a delete doesn't delete subcollections https://firebase.google.com/docs/firestore/manage-data/delete-data#delete_documents
      // hearts subcollection probably still needs to be deleted
      // TODO Consider checking the post for an uploaded image and remove it from storage bucket as well?
      await deleteDoc(postRef);
      router.push('/admin');
      toast('post annihilated ', { icon: '🗑️' });
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
}
