// +build !dist,!distbundle

package bundle

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// BaseDir is the path to the VSCode-browser or VSCode-browser-min
// directory built by running `gulp vscode-browser` or `gulp
// vscode-browser-min` in the Sourcegraph fork of vscode.
//
// It is used by Handler when running in dev mode (neither the build
// tag "dist" nor "distbundle" is satisfied), and it's used when
// running `go generate` on this package.
//
// If empty at dev time, the vscode app will not be available on this
// server.
var BaseDir = os.Getenv("VSCODE_BROWSER_PKG")

var Data http.FileSystem

func init() {
	if BaseDir != "" {
		Data = http.Dir(BaseDir)
	}

	// Cache when vscode is built; if serving from $VSCODE/out, do not
	// cache.
	if isBuilt := strings.HasPrefix(filepath.Base(BaseDir), "VSCode-browser"); isBuilt {
		cacheControl = "max-age=300, must-revalidate" // long enough for cached perf testing
	} else {
		cacheControl = "no-cache"
	}
}
