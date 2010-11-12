TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js

test:
	@CONNECT_ENV=test ./$(TEST) \
		-I lib \
		-I support/connect/lib \
		$(TEST_FLAGS) $(TESTS)

.PHONY: test