FROM golang:1.27-alpine@sha256:4c9fe60190a2a3350ddc51de80d0224b8a6698d12bdfc999fee45ea9d6c46dbc as base
RUN go install github.com/google/go-containerregistry/cmd/crane@v0.6.0

FROM golang:1.27-alpine@sha256:4c9fe60190a2a3350ddc51de80d0224b8a6698d12bdfc999fee45ea9d6c46dbc as repo-copy
WORKDIR /go/src/github.com/akhilerm/repo-copy
RUN --mount=target=. go build -o /out/repo-copy ./

FROM alpine
COPY --from=base /go/bin/crane /bin/crane
COPY --from=repo-copy /out/repo-copy /bin/repo-copy
ENTRYPOINT ["/bin/repo-copy"]