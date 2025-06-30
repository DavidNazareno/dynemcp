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


pnpm run clean
pnpm install
pnpm run beautify


# Exit immediately if a command exits with a non-zero status.
set -e

# Function to display template selection menu
select_template() {
    echo "📋 Available templates:"
    echo "----------------------------------------"
    PS3="Please select a template (1-5): "
    templates=("default" "calculator" "dynamic-agent" "http-server" "secure-agent")
    select template in "${templates[@]}"; do
        if [ -n "$template" ]; then
            echo "Selected template: $template"
            TEMPLATE_NAME=$template
            break
        else
            echo "Invalid selection. Please try again."
        fi
    done
    echo "----------------------------------------"
}

# --- Go to project root ---
# This ensures the script can be run from anywhere in the project.
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR/.."
# ---

echo "🚀 Starting the template test script..."
echo "----------------------------------------"

# --- Configuration ---
# If no template is provided as argument, show selection menu
if [ -z "$1" ]; then
    select_template
else
    TEMPLATE_NAME=$1
fi

# Now that TEMPLATE_NAME is defined, we can set up the app names
APP_NAME="my-test-mcp-server-$TEMPLATE_NAME"
EXAMPLES_DIR="examples"
APP_PATH="$EXAMPLES_DIR/$APP_NAME"

echo "🎯 Using template: $TEMPLATE_NAME"
echo "📂 App name will be: $APP_NAME"
echo "----------------------------------------"
# ---

# 1. Build the create-dynemcp package to ensure we're using the latest version
echo "📦 Building 'create-dynemcp' package..."
pnpm run build
echo "✅ Build complete."
echo "----------------------------------------"

# 2. Navigate into the examples directory and clean up
echo "🧹 Cleaning up previous test server at '$APP_PATH' (if it exists)..."
# Create the examples dir if it doesn't exist
mkdir -p $EXAMPLES_DIR
cd $EXAMPLES_DIR
rm -rf $APP_NAME
echo "✅ Cleanup complete."
echo "----------------------------------------"

# 3. Run the create-dynemcp generator from the examples directory
echo "🌱 Creating new test MCP server from template '$TEMPLATE_NAME'..."
# We need to call the generator using a relative path from the new CWD
node ../packages/create-dynemcp/dist/src/index.js $APP_NAME --template $TEMPLATE_NAME --yes --skip-install
echo "✅ MCP server created at '$APP_NAME'."
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
pnpm run inspector 