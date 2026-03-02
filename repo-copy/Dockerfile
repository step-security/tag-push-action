FROM golang:1.17-alpine@sha256:99ddec1bbfd6d6bca3f9804c02363daee8c8524dae50df7942e8e60788fd17c9 as base
RUN go install github.com/google/go-containerregistry/cmd/crane@v0.6.0

FROM golang:1.17-alpine@sha256:99ddec1bbfd6d6bca3f9804c02363daee8c8524dae50df7942e8e60788fd17c9 as repo-copy
WORKDIR /go/src/github.com/akhilerm/repo-copy
RUN --mount=target=. go build -o /out/repo-copy ./

FROM alpine
COPY --from=base /go/bin/crane /bin/crane
COPY --from=repo-copy /out/repo-copy /bin/repo-copy
ENTRYPOINT ["/bin/repo-copy"]