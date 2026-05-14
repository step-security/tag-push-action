FROM golang:1.26-alpine@sha256:d4c4845f5d60c6a974c6000ce58ae079328d03ab7f721a0734277e69905473e5 as base
RUN go install github.com/google/go-containerregistry/cmd/crane@v0.6.0

FROM golang:1.26-alpine@sha256:d4c4845f5d60c6a974c6000ce58ae079328d03ab7f721a0734277e69905473e5 as repo-copy
WORKDIR /go/src/github.com/akhilerm/repo-copy
RUN --mount=target=. go build -o /out/repo-copy ./

FROM alpine
COPY --from=base /go/bin/crane /bin/crane
COPY --from=repo-copy /out/repo-copy /bin/repo-copy
ENTRYPOINT ["/bin/repo-copy"]