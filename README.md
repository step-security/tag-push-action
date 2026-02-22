# tag-push-action

## Usage

### Basic

```yaml
name: Push-Image

on: push

jobs:
  push-image:
    runs-on: ubuntu-latest
    steps:

      - name: Login Quay
        uses: step-security/docker-login-action@v3
        with:
          registry: 'quay.io'
          username: ${{ secrets.QUAY_USERNAME }}
          password: ${{ secrets.QUAY_TOKEN }}

      - name: Login Dockerhub
        uses: step-security/docker-login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Push image
        uses: step-security/tag-push-action@v2
        with:
          src: docker.io/step-security/node-disk-manager:ci
          dst: |
            quay.io/step-security/node-disk-manager-amd64:ci
```

1. Login to all the registries from which you want to pull and push the multiplatform image.


2. Specify the `src` and `dst` registry, both of which are mandatory fields. The action allows multiple destination registries specified as a yaml string.

**NOTE: If dockerhub is used, make sure that `docker.io` is specified in the image name**

### Using with `docker/metadata-action`

The action can be used alongside [metadata-action](https://github.com/docker/metadata-action) to generate
tags easily.

```yaml
name: Push-Image

on: push

jobs:
  push-image:
    runs-on: ubuntu-latest
    steps:

      - name: Login Dockerhub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v3
        with:
          images: docker.io/step-security/node-disk-manager     

      - name: Push image
        uses: step-security/tag-push-action@v2
        with:
          src: docker.io/step-security/node-disk-manager:ci
          dst: |
            ${{ steps.meta.outputs.tags }}
```

The output tags from the `meta` step can be used as destination tags for this github action.

### Use a custom docker config file

The standard docker config path on GitHub runner is `/home/runner/.docker/config.json`. In case you're running on a custom GitHub runner, and your config path is not standard, then the `docker-config-path` can be used.

```yaml
  - name: Push image
    uses: step-security/tag-push-action@v2
    with:
      docker-config-path: /home/myuser/.docker/config.json
      src: docker.io/step-security/node-disk-manager:ci
      dst: |
        quay.io/step-security/node-disk-manager-amd64:ci
```
