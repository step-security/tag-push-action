FROM golang:1.25-alpine@sha256:1ae0735f00daffa3aaf1363a5184c0d2dc55c78e3db4ec70241cdac97bf84b59 as base
RUN go install github.com/google/go-containerregistry/cmd/crane@v0.6.0

FROM golang:1.25-alpine@sha256:1ae0735f00daffa3aaf1363a5184c0d2dc55c78e3db4ec70241cdac97bf84b59 as repo-copy
WORKDIR /go/src/github.com/akhilerm/repo-copy
RUN --mount=target=. go build -o /out/repo-copy ./

FROM alpine
COPY --from=base /go/bin/crane /bin/crane
COPY --from=repo-copy /out/repo-copy /bin/repo-copy
ENTRYPOINT ["/bin/repo-copy"]