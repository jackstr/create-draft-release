# create-draft-release

## Usage

Create update-changelog.yml file:
```
name: Create draft release

on: [workflow_dispatch]

jobs:
  create-draft-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: jackstr/create-draft-release@master
```

Run the workflow:
```
# Get token at https://github.com/settings/tokens/new
curl \
    -u $user:$token \
    -X POST \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/jackstr/seamly2d/actions/workflows/create-draft-release.yml/dispatches \
    -d '{"ref": "develop"}' # branch name
```
