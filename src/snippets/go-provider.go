// [!region setup]
package main

import (
	"os"

	"github.com/tempoxyz/tempo-go/pkg/client"
)

func newClient() *client.Client {
	return client.New(os.Getenv("TEMPO_RPC_URL"))
}
// [!endregion setup]
