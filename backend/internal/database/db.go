package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func ConnectDB(databaseURL string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("unable to parse database config: %w", err)
	}

	config.MaxConns = 25
	config.MinConns = 2
	config.MaxConnLifetime = 30 * time.Minute
	config.MaxConnIdleTime = 5 * time.Minute

	var pool *pgxpool.Pool
	ctx := context.Background()

	// Wait loop with retry for database readiness (useful for Docker container startup)
	maxRetries := 15
	for i := 1; i <= maxRetries; i++ {
		pool, err = pgxpool.NewWithConfig(ctx, config)
		if err == nil {
			pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
			err = pool.Ping(pingCtx)
			cancel()
			if err == nil {
				log.Printf("Successfully connected to PostgreSQL database")
				Pool = pool
				return pool, nil
			}
		}

		log.Printf("Waiting for database connection (attempt %d/%d): %v", i, maxRetries, err)
		time.Sleep(2 * time.Second)
	}

	return nil, fmt.Errorf("could not connect to database after %d attempts: %w", maxRetries, err)
}

func CloseDB() {
	if Pool != nil {
		Pool.Close()
	}
}
