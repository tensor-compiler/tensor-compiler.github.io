all: docs

docs:
	cd documentation && mkdocs build && mv ../docs/reference site && rsync -a --delete site/* ../docs/ && rm -rf site

.PHONY: docs
