SHARED	=	./data/shared/core		\
			./data/shared/server

RESOURCES =	./data/resources/[scripts]/player-spawn

SRC =		$(SHARED) $(RESOURCES)

all: install build

install:
	@FAILED=0; \
	for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Installing] $$dir" $(DEFAULT); \
		cd "$$dir" && yarn install && cd "$(CURDIR)" && $(ECHO) $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || { cd "$(CURDIR)"; $(ECHO) $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT); FAILED=1; }; \
	done; \
	if [ $$FAILED -eq 1 ]; then exit 1; fi

build:
	@FAILED=0; \
	for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Building] $$dir" $(DEFAULT); \
		cd "$$dir" && yarn build && cd "$(CURDIR)" && $(ECHO) $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || { cd "$(CURDIR)"; $(ECHO) $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT); FAILED=1; }; \
	done; \
	if [ $$FAILED -eq 1 ]; then exit 1; fi

clean:
	@FAILED=0; \
	for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Cleaning] $$dir" $(DEFAULT); \
		rm -rf "$$dir/build/" "$$dir/node_modules/" && $(ECHO) $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || { $(ECHO) $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT); FAILED=1; }; \
	done; \
	if [ $$FAILED -eq 1 ]; then exit 1; fi

re: clean all

.PHONY: all install build clean re


ECHO	=			/bin/echo -e
DEFAULT	=			"\033[00m"

DEFAULT	=			"\e[0m"
BOLD	=			"\e[1m"
DIM		=			"\e[2m"
UNDLN	=			"\e[4m"
SHINE	=			"\e[5;37m"
RODE	=			"\e[9;37m"

BLACK	=			"\e[30m"
RED		=			"\e[31m"
GREEN	=			"\e[32m"
YELLOW	=			"\e[33m"
BLUE	=			"\e[34m"
MAGEN	=			"\e[35m"
CYAN	=			"\e[36m"
WHITE	=			"\e[1;37m"

LIGHT_RED		=	"\e[91m"
LIGHT_GREEN		=	"\e[92m"
LIGHT_YELLOW	=	"\e[93m"
LIGHT_BLUE		=	"\e[94m"
LIGHT_MAGEN		=	"\e[95m"
LIGHT_CYAN		=	"\e[96m"
