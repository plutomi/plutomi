package context

// This is in it's own file to avoid a circular dependency
import (
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	types "plutomi/shared/types"
)

type AppContext struct {
	Env         types.EnvironmentVariables
	Logger      *zap.Logger
	Service string
	MySQL       *sqlx.DB
}
