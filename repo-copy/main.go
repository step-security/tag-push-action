package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
)

func executeCommand(args []string) error {
	fmt.Println("executing crane with args:", args)
	cmd := exec.Command("crane", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func replicateImage(src string, dest string) error {
	return executeCommand([]string{"copy", src, dest})
}

func replicateToAll(src string, dest []string) error {
	for _, d := range dest {
		if err := replicateImage(src, d); err != nil {
			return err
		}
	}
	return nil
}

func main() {
	flag.Parse()
	args := flag.Args()

	if len(args) < 2 {
		fmt.Fprintf(os.Stderr, "usage: %s <src> <dest> [<dest>]\n", os.Args[0])
		os.Exit(1)
	}

	if err := replicateToAll(args[0], args[1:]); err != nil {
		panic(err)
	}
}
