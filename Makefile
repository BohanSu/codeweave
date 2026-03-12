.PHONY: build test lint clean demo install

build:
	npm run build

test:
	npm test

test:watch:
	npm run test:watch

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf dist coverage node_modules/.cache

demo: build
	@echo "Running demo on examples directory..."
	@node dist/cli.js examples/ --format tree

demo-json: build
	@node dist/cli.js examples/ --format json > examples/output-graph.json
	@echo "Output written to examples/output-graph.json"

demo-html: build
	@node dist/cli.js examples/ --format html > examples/output-graph.html
	@echo "Output written to examples/output-graph.html"

install:
	npm install
