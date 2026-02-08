SRC =	./data/shared/core							\
		./data/shared/server						\
		./data/resources/\[scripts\]/player-spawn	\

all:
	@FAILED=0; \
	for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Building] $$dir" $(DEFAULT); \
		npm run build -s --prefix $$dir && $(ECHO) $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || { $(ECHO) $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT); FAILED=1; }; \
	done; \
	if [ $$FAILED -eq 1 ]; then exit 1; fi

install:
	@FAILED=0; \
	for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Installing development environment] $$dir" $(DEFAULT); \
		npm i --prefix $$dir && $(ECHO) $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || { $(ECHO) $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT); FAILED=1; }; \
	done; \
	if [ $$FAILED -eq 1 ]; then exit 1; fi

install_prod:
	@FAILED=0; \
	for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Installing production environment] $$dir" $(DEFAULT); \
		npm ci --production --prefix $$dir && $(ECHO) $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || { $(ECHO) $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT); FAILED=1; }; \
	done; \
	if [ $$FAILED -eq 1 ]; then exit 1; fi

clean:
	@FAILED=0; \
	for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Cleaning] $$dir" $(DEFAULT); \
		rm -rf $$dir/build/ $$dir/node_modules/ && $(ECHO) $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || { $(ECHO) $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT); FAILED=1; }; \
	done; \
	if [ $$FAILED -eq 1 ]; then exit 1; fi

re: clean install all
re_prod: clean install all install_prod

.PHONY: all install install_prod clean re re_prod


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