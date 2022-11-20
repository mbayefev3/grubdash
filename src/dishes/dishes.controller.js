const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res) {
  //   this will list all available dishes
  res.status(200).json({
    data: dishes
  })
}






function dishIdExists(req, res, next) {
  const { data: { id } = {} } = req.body
  const dishId = req.params.dishId
  const foundDish = dishes.find(({ id }) => id === dishId)

  if (!foundDish) {
    return next({ status: 404, message: `Path not found: ${req.originalUrl}` });

  }
  if (id && dishId && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
  }
  if (foundDish) {

    res.locals.dish = foundDish
    return next()
  }


}

function nameExists(req, res, next) {
  const { data: { name } = {} } = req.body
  if (!name) {
    next({
      status: 400,
      message: "Dish must include a name"
    })
  } else {
    next()
  }
}

function descriptionExists(req, res, next) {
  const { data: { description } = {} } = req.body
  if (!description) {
    next({
      status: 400,
      message: "Dish must include a description"
    })
  } else {
    next()
  }
}


// price property is not an integer	Dish must have a price that is an integer greater than 0
function priceExists(req, res, next) {
  const { data: { price } = {} } = req.body
  if (price === undefined) {
    next({
      status: 400,
      message: "Dish must include a price"
    })
  } else if (price <= 0) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0"
    })
  } else if (!Number.isInteger(price)) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0"
    })
  }

  else {
    next()
  }
}

function imageUrlExists(req, res, next) {
  const { data: { image_url } = {} } = req.body
  if (!image_url) {
    next({
      status: 400,
      message: "Dish must include a image_url"
    })
  } else {
    next()
  }
}


function create(req, res) {
  res.status(201).json({
    data: {
      id: nextId(),
      ...req.body.data
    }
  })

  dishes.push({
    id: nextId(),
    ...req.body.data
  })

}


function read(req, res) {
  const foundDish = res.locals.dish
  res.status(200).json({
    data: foundDish
  })
}


// :dishId does not exist	Dish does not exist: ${dishId}.
// id in the body does not match :dishId in the route	Dish id does not match route id. Dish: ${id}, Route: ${dishId}

function update(req, res) {
  const { dishId } = req.params
  const { data: { id, description, price, image_url, name } = {} } = req.body
  //   All update handlers guarantee that the id property of the stored data cannot be overwritten.
  const updatedDish = {
    ...res.locals.dish,
    description, price, image_url, name
  }

  res.status(200).json({
    data: updatedDish
  })

}

module.exports = {
  list,
  create: [nameExists, priceExists, descriptionExists, imageUrlExists, create],
  read: [dishIdExists, read],
  update: [dishIdExists, nameExists, priceExists, descriptionExists, imageUrlExists, update]
}

// TODO: Implement the /dishes handlers needed to make the tests pass
