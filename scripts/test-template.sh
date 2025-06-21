#!/bin/bash

# A script to automate testing of the create-dynemcp templates.
#
# This script will:
# 1. Build the necessary packages.
# 2. Navigate to the /examples directory.
# 3. Remove any previous test application.
# 4. Generate a new test application using `create-dynemcp`.
# 5. Modify its package.json to use the local workspace version of @dynemcp/dynemcp.
# 6. Install dependencies using pnpm.
# 7. Start the development server with the inspector.

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Go to project root ---
# This ensures the script can be run from anywhere in the project.
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR/.."
# ---

echo "🚀 Starting the template test script..."
echo "----------------------------------------"

# --- Configuration ---
# The name of the template to test. Default is 'default'.
# You can run this script with an argument to test another template, e.g., ./scripts/test-template.sh calculator
TEMPLATE_NAME=${1:-default}
APP_NAME="my-test-app"
EXAMPLES_DIR="examples"
APP_PATH="$EXAMPLES_DIR/$APP_NAME"
# ---

# 1. Build the create-dynemcp package to ensure we're using the latest version
echo "📦 Building 'create-dynemcp' package..."
pnpm nx build create-dynemcp
echo "✅ Build complete."
echo "----------------------------------------"

# 2. Navigate into the examples directory and clean up
echo "🧹 Cleaning up previous test app at '$APP_PATH' (if it exists)..."
# Create the examples dir if it doesn't exist
mkdir -p $EXAMPLES_DIR
cd $EXAMPLES_DIR
rm -rf $APP_NAME
echo "✅ Cleanup complete."
echo "----------------------------------------"

# 3. Run the create-dynemcp generator from the examples directory
echo "🌱 Creating new test app from template '$TEMPLATE_NAME'..."
# We need to call the generator using a relative path from the new CWD
node ../packages/create-dynemcp/dist/index.js $APP_NAME --template $TEMPLATE_NAME --yes --skip-install
echo "✅ App created at '$APP_NAME'."
echo "----------------------------------------"

# 4. Navigate into the new app directory and prepare it
echo "🔧 Configuring the new project..."
cd $APP_NAME

echo "   - Modifying package.json to use workspace dependencies..."
# This command replaces any version of @dynemcp/dynemcp with "workspace:*"
# Note: The syntax `sed -i ''` is for macOS. For GNU/Linux, you would use `sed -i`.
sed -i '' 's/"@dynemcp\/dynemcp": ".*"/"@dynemcp\/dynemcp": "workspace:*"/' package.json
echo "   - ✅ package.json updated."

# 5. Install dependencies
echo "📦 Installing dependencies with pnpm..."
pnpm install
echo "✅ Dependencies installed."
echo "----------------------------------------"

# 6. Run the development server
echo "🚀 Starting the development server for '$APP_NAME'..."
echo "   You can now open the MCP Inspector."
echo "   Press Ctrl+C to stop the server and exit the script."
echo "----------------------------------------"
pnpm run dev 