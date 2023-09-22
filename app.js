// const http = require("http");
// core package
const fs = require("fs")
//

const express = require("express")
const morgan = require("morgan")
const app = express()

//MIDLEWARE --> express
app.use(express.json()) // memodikasi incoming req, re body ke API
app.use(morgan("dev"))
// OUR OWN MIDDLEWARE

app.use((req, res, next) => {
  console.log("Hello FSW2 di middleware kita sendiri")
  next()
})

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  console.log(req.requestTime) // proses midleware
  next()
})

// miidleware utk check
// app.use((req, res, next) => {
//   if (req.body.username !== "user")
//     return res.status(400).json({
//       message: "kamu gk blh akses",
//     })
// })

const port = process.env.PORT || 3000

// app.get("/", (req, res) => {
//   res.status(400).json({
//     message: "hello fsw2",
//   });
// });

// REFACTORING => menghindari redudan code

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
)

const getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: {
      users,
    },
  })
}

const getUsersById = (req, res) => {
  const id = req.params.id
  const user = users.find((el) => el._id === id)

  if (!user) {
    return res.status(404).json({
      status: "failed",
      message: `data with ${id} not found`,
    })
  }

  res.status(200).json({
    status: "success",
    data: {
      user, // Mengirimkan tur yang sesuai sebagai respons, bukan seluruh array tours
    },
  })
}

const postUsers = (req, res) => {
  console.log(req.body.role)
  const newId = users[users.length - 1]._id + 1
  const newData = Object.assign(
    {
      id: newId,
    },
    req.body
  )

  users.push(newData)
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      // 201 -> created
      res.status(201).json({
        status: "succes",
        data: {
          user: newData,
        },
      })
    }
  )
}

const editUsers = (req, res) => {
  // const id = req.params.id * 1  // utk int
  const id = req.params.id // utk string
  // findIndex = -1 (kalau data nya gk ada)
  const userIndex = users.findIndex((el) => el._id === id)

  if (userIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: `data with ${id} this not found`,
    })
  }

  users[userIndex] = { ...users[userIndex], ...req.body }

  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(200).json({
        status: "success",
        message: `tour with this id ${id} edited`,
        data: {
          user: users[userIndex],
        },
      })
    }
  )
}

const deleteUsers = (req, res) => {
  const id = req.params.id
  // cari index sesuai id
  const userIndex = users.findIndex((el) => el._id === id)

  // validasi kalau data yg sesuai req.params.id tdk ada
  if (userIndex === -1) {
    return res.status(404).json({
      status: "failed",
      message: "data not found",
    })
  }

  // proses menghapus data sesuai id/ index dari req.param.id
  users.splice(userIndex, 1)
  // proses update di file jsonnya
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(200).json({
        status: "success",
        message: "berhasil delete data",
        data: null,
      })
    }
  )
}

// ROOTING
// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getTourById);
// app.post("/api/v1/tours", postTour);
// app.patch("/api/v1/tours/:id", editTour);
// app.delete("/api/v1/tours/:id", deleteTour);

const userRouter = express.Router()

// ROUTES UNTUK USERS
userRouter.route("/").get(getAllUsers).post(postUsers)

userRouter.route("/:id").get(getUsersById).patch(editUsers).delete(deleteUsers)

app.use("/api/v1/users", userRouter)

app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
