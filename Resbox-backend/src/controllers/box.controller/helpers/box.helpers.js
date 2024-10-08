const Box = require('../../../models/box.model/box.model')
const User = require('../../../models/user.model/user.model')

const updateUserBox = async (userId, boxId, usageLimit) => {
  return User.findOneAndUpdate(
    { _id: userId, 'purchasedBoxes.box': boxId },
    { $inc: { 'purchasedBoxes.$.remainingItems': usageLimit } },
    { new: true }
  )
}

const updateBoxItemsAcquired = async (boxId, userId, quantity = 1) => {
  return Box.findByIdAndUpdate(
    boxId,
    {
      $push: { items_acquired_by: { user: userId, box: boxId } },
      $inc: { purchase_count: quantity }
    },

    { new: true }
  )
}

const getUserDetails = async (userId) => {
  return User.findById(userId)
    .select('-password')
    .populate({
      path: 'purchasedBoxes.box',
      select:
        'name_box description items_included bonus_items price status createdAt updatedAt'
    })
    .populate({
      path: 'purchasedBoxes.id_partner_consumed',
      populate: {
        path: 'users',
        select: 'name avatar'
      }
    })
    .populate('idPartner')
}

const addUserBox = async (userId, boxId, usageLimit) => {
  return User.findByIdAndUpdate(
    userId,
    { $push: { purchasedBoxes: { box: boxId, remainingItems: usageLimit } } },
    { new: true }
  )
}

module.exports = {
  updateUserBox,
  updateBoxItemsAcquired,
  getUserDetails,
  addUserBox
}

//! PENDIENTE POR HACER:
//? PASARELA DE PAGO PAYPAL 💰
//? COMENTARIOS Y NOTIFICACIONES 🪧
//? REGALOS 🎁