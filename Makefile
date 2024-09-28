SRC =	./data/resources/[local]/test-mongo	\

all:
	@for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Building] $$dir" $(DEFAULT); \
		npm run build -s --prefix $$dir && $(ECHO) -n $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || $(ECHO) -n $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT) && $(ECHO) $(BOLD); \
	done

install:
	@for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Installing development environment] $$dir" $(DEFAULT); \
		npm i --prefix $$dir && $(ECHO) -n $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || $(ECHO) -n $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT) && $(ECHO) $(BOLD); \
	done

install_prod:
	@for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Installing production environment] $$dir" $(DEFAULT); \
		npm ci --production --prefix $$dir && $(ECHO) -n $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || $(ECHO) -n $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT) && $(ECHO) $(BOLD); \
	done

clean:
	@for dir in $(SRC); do \
		$(ECHO) $(BOLD) $(CYAN)"[Cleaning] $$dir" $(DEFAULT); \
		rm -rf $$dir/build/ $$dir/node_modules/ && $(ECHO) -n $(BOLD) $(WHITE) $$dir $(GREEN)"[OK]"$(DEFAULT) || $(ECHO) -n $(BOLD) $(WHITE) $$dir $(RED)"[KO]"$(DEFAULT) && $(ECHO) $(BOLD); \
	done

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