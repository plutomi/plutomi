package consumers

import (
	"context"
	"time"

	"go.uber.org/zap"

	ctx "plutomi/shared/context"
)

const WORK_DElAY = 1 * time.Second


func StartConsumer(ctx context.Context, appCtx *ctx.AppContext, performWork func(*ctx.AppContext) (bool, error)) error {
	for {
		select {
		case <-ctx.Done():
			// Stop the worker when the context is canceled
			// Sleep for a bit to allow for cleanup
			appCtx.Logger.Info("Worker stopping as context was canceled")
			time.Sleep(5 * time.Second)
			appCtx.Logger.Info("Worker stopped")
			return nil
		default:
			// Perform the background work
			hasWork, err := performWork(appCtx)
			if err != nil {
				appCtx.Logger.Error("Error performing work", zap.String("error", err.Error()))
			}

			if !hasWork {
				// If no work was done, wait before polling again
				time.Sleep(WORK_DElAY)
			}
		}
	}
}
