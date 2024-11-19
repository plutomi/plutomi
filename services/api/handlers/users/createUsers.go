package users

import (
	"encoding/json"
	"net/http"
	"plutomi/api/types"
	"strconv"

	"plutomi/shared/constants"
	ctx "plutomi/shared/context"
	utils "plutomi/shared/utils"

	"github.com/go-chi/render"
	"go.uber.org/zap"

	ctypes "plutomi/shared/types"
)

type DBUser struct {
	ID        int             `db:"id" json:"id"`
	FirstName string          `db:"first_name" json:"first_name"`
	LastName  string          `db:"last_name" json:"last_name"`
	Email     string          `db:"email" json:"email"`
	PublicId  string          `db:"public_id" json:"public_id"`
	CreatedAt ctypes.JSONTime `db:"created_at" json:"created_at"`
	UpdatedAt ctypes.JSONTime `db:"updated_at" json:"updatedAt"`
}

type CreateUserRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
}

type PlutomiUserCreatedResponse struct {
	Message string `json:"message"`
	User    DBUser `json:"user"`
}

func CreateUsers(w http.ResponseWriter, r *http.Request, ctx *ctx.AppContext) {
	var req CreateUserRequest

	// Parse JSON from request body

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, types.BasePlutomiResponse{
			Message: "Invalid request body when creating a user",
			DocsUrl: "https://plutomi.com/docs/api/users/create",
		})
		return
	}

	ctx.Logger.Info("Creating user", zap.String("email", req.Email), zap.String("first_name", req.FirstName), zap.String("last_name", req.LastName))

	// Prepare statement for inserting user into database
	insertedUser, err := ctx.MySQL.Exec("INSERT INTO users (first_name, last_name, email, public_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(3), NOW(3))",
		req.FirstName, req.LastName, req.Email, utils.GenerateID(12))
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		res := types.BasePlutomiResponse{
			Message: "Failed to insert",
			DocsUrl: "https://plutomi.com/docs/api/users/create",
		}
		ctx.Logger.Error("Failed to insert user", zap.Error(err))
		render.JSON(w, r, res)
		return
	}

	lastInsertID, err := insertedUser.LastInsertId()

	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		res := types.BasePlutomiResponse{
			Message: "Failed to retrieve last insert ID",
			DocsUrl: "https://plutomi.com/docs/api/users/create",
		}
		render.JSON(w, r, res)
		return
	}
	ctx.Logger.Info("User created", zap.Int64("id", lastInsertID))

	idString := strconv.FormatInt(lastInsertID, 10)

	// ctx.Kafka.PublishToTopic(constants.TopicTest, idString, "value")

	// Retrieve the user from the database

	ctx.Logger.Info("getting user from db again", zap.Int64("id", lastInsertID))

	var user DBUser
	usrErr := ctx.MySQL.Get(&user, "SELECT * FROM users WHERE id = ?", lastInsertID)
	if usrErr != nil {
		render.Status(r, http.StatusInternalServerError)

		res := PlutomiUserCreatedResponse{
			Message: "An error ocurred getting user after insert",
			User:    user,
		}

		ctx.Logger.Error("Failed to get user after insert", zap.Error(usrErr))
		render.JSON(w, r, res)
		return
	}
	ctx.Logger.Info("Retrieved user, inserting into kafka", zap.Int64("id", lastInsertID))

	ctx.Kafka.PublishToTopic(constants.TopicTest, idString, user)

	ctx.Logger.Info("SENT to kafka", zap.Int64("id", lastInsertID))

	//Prepare the response
	res := PlutomiUserCreatedResponse{
		Message: "User created successfully",
		User:    user,
	}

	render.Status(r, http.StatusCreated)
	render.JSON(w, r, res)
}
