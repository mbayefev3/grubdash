const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));


// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");



const validOrderStatus = (req, res, next) => {

  const { data: { id, status } = {} } = req.body
  const { orderId } = req.params

  if (!status && (id && orderId)) {
    return next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
    })
  }

  if (status === 'delivered' && (id && orderId)) {
    return next({
      status: 400,
      message: `A delivered order cannot be changed`
    })
  }

  if (status === 'invalid' && (id && orderId)) {
    return next({
      status: 400,
      message: `status invalid`
    })
  }

  next()

}

const orderIdExists = (req, res, next) => {
  const { data: { id, status } = {} } = req.body
  const { orderId } = req.params
  const foundOrder = orders.find(({ id }) => id === orderId)

  if (!foundOrder) {
    next({ status: 404, message: `Path not found: ${req.originalUrl}` });
  }

  if (id && orderId && (id !== orderId)) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
    })
  }


  if (foundOrder) {
    res.locals.order = foundOrder
    next()
  }
}



const deliverToExists = (req, res, next) => {

  const { data: { deliverTo } = {} } = req.body
  if (!deliverTo) {
    next({
      status: 400,
      message: 'Order must include a deliverTo'
    })
  } else {
    next()
  }
}

const mobileNumberExists = (req, res, next) => {
  const { data: { mobileNumber } = {} } = req.body

  if (!mobileNumber) {
    next({
      status: 400,
      message: 'Order must include a mobileNumber'
    })
  } else {
    next()
  }
}

const dishesExists = (req, res, next) => {

  const { data: { dishes } = {} } = req.body
  if (dishes === undefined) {
    next({
      status: 400,
      message: 'Order must include a dish'
    })
  } else if (!Array.isArray(dishes)) {
    next({
      status: 400,
      message: 'Order must include at least one dish'
    })
  } else if (dishes.length === 0) {

    next({
      status: 400,
      message: 'Order must include at least one dish'
    })
  } else {
    next()
  }

}



const dishQuantityExists = (req, res, next) => {

  const { data: { dishes } = {} } = req.body
  for (let i = 0; i < dishes.length; i++) {
    const { quantity, id: index } = dishes[i]
    if (quantity === undefined || !Number.isInteger(quantity) || quantity <= 0) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`
      })

    }
  }

  next()

}


// status property of the order !== "pending"	An order cannot be deleted unless it is pending. Returns a 400 status code

const destroy = (req, res, next) => {

  const { status, id } = res.locals.order
  if (status === 'pending') {

    const index = orders.findIndex(({ id: orderId }) => orderId === id)
    orders.splice(index, 1)

    return res.status(204).send()

  }

  if (status !== 'pending') {
    return next({
      status: 400,
      message: `pending`
    })
  }

}



const create = (req, res) => {

  const { data = {} } = req.body
  res.status(201).json({
    data: {
      id: nextId(),
      ...req.body.data
    }
  })
  orders.push({
    id: nextId(),
    ...req.body.data
  }
  )
}


const read = (req, res) => {
  res.status(200).json({
    data: {
      ...res.locals.order

    }
  })
}


const update = (req, res) => {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
  res.status(200).json({
    data: {
      ...res.locals.order,
      deliverTo, mobileNumber, status, dishes
    }
  })
}


const list = (req, res) => {
  res.json({
    data: orders
  })
}




module.exports = {
  list,
  create: [deliverToExists, mobileNumberExists, dishesExists, dishQuantityExists, create],
  read: [orderIdExists, read],
  update: [orderIdExists, validOrderStatus, deliverToExists, mobileNumberExists, dishesExists, dishQuantityExists, update],
  delete: [orderIdExists, destroy]
}
// TODO: Implement the /orders handlers needed to make the tests pass
