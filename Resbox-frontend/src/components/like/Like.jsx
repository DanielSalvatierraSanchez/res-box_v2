import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/auth/AuthContext'
import { ReducersContext } from '../../context/reducers/ReducersContext'
import HeartLoader from '../loader/HeartLoader'
import './Like.css'
import like from '/images/like.png'
import heart from '/images/heart.png'
import { fetchLike } from '../../services/fetch-like/fetchLike'

const Like = ({ idPartner }) => {
  const { token, API_URL, setStateBoxCard } = useContext(AuthContext)
  const {
    stateIsAuth: { user },
    dispatchAuth,
    statePartners: { partners },
    dispatchPartners,
    dispatchToast
  } = useContext(ReducersContext)

  const [loadLike, setLoadLike] = useState(false)

  const handleAddToFavorite = async () => {
    try {
      setLoadLike(true)
      const urlApi = `${import.meta.env.VITE_URL_API}/${
        API_URL.like
      }/${idPartner}`
      const { response, data } = await fetchLike(urlApi, token)
      console.log(response)

      if (response.status !== 201) {
        const error = new Error('Hubo un problema en su solicitud.')
        dispatchToast({
          type: 'ADD_NOTIFICATION',
          payload: {
            msg: error,
            error: true
          }
        })
        return
      }
      const updatePartner = partners?.find(
        (partner) => partner._id.toString() === idPartner.toString()
      )
      if (data.favorites) {
        dispatchAuth({
          type: 'SET_USER',
          payload: { ...user, favorites: data.favorites.favorites }
        })
        if (updatePartner) {
          updatePartner.favorite = updatePartner.favorite + 1
          const updatedPartners = partners.map((par) =>
            par._id.toString() === idPartner.toString()
              ? { ...updatePartner, favorite: updatePartner.favorite }
              : par
          )
          dispatchPartners({
            type: 'SET_PARTNERS',
            payload: updatedPartners
          })
        }
        setTimeout(() => {
          setStateBoxCard((prevState) => ({
            ...prevState,
            infoPartner: {
              ...prevState.infoPartner,
              favorite: prevState.infoPartner.favorite + 1
            }
          }))
        }, 1000)
      } else {
        const updatedFavorites = user.favorites.filter(
          (fav) => fav !== idPartner
        )
        if (updatePartner) {
          updatePartner.favorite = updatePartner.favorite - 1
          const updatedPartners = partners.map((par) =>
            par._id.toString() === idPartner.toString()
              ? { ...updatePartner, favorite: updatePartner.favorite }
              : par
          )
          dispatchPartners({
            type: 'SET_PARTNERS',
            payload: updatedPartners
          })
        }
        setTimeout(() => {
          setStateBoxCard((prevState) => ({
            ...prevState,
            infoPartner: {
              ...prevState.infoPartner,
              favorite: prevState.infoPartner.favorite - 1
            }
          }))
        }, 1000)
        dispatchAuth({
          type: 'SET_USER',
          payload: { ...user, favorites: updatedFavorites }
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setTimeout(() => {
        setLoadLike(false)
      }, 1000)
    }
  }

  const existFavorite = user?.favorites?.some((exist) => exist === idPartner)

  return (
    <div className='like-content-favorite'>
      {loadLike ? (
        <HeartLoader />
      ) : (
        <>
          {existFavorite ? (
            <button onClick={handleAddToFavorite}>
              <img
                alt='Like'
                src={like}
                width='30'
                className=''
                title='Favorito'
                loading='lazy'
              />
            </button>
          ) : (
            <button onClick={handleAddToFavorite}>
              <img
                alt='Like'
                src={heart}
                width='30'
                title='Agregar a favorito'
                loading='lazy'
              />
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default Like
