WORKSPACE = ./data

all:
	@$(ECHO) $(BOLD) $(CYAN)"[Building all packages]" $(DEFAULT)
	@cd $(WORKSPACE) && pnpm -r build && $(ECHO) $(BOLD) $(GREEN)"[Build complete]"$(DEFAULT) || $(ECHO) $(BOLD) $(RED)"[Build failed]"$(DEFAULT)

install:
	@$(ECHO) $(BOLD) $(CYAN)"[Installing development environment]" $(DEFAULT)
	@cd $(WORKSPACE) && pnpm install && $(ECHO) $(BOLD) $(GREEN)"[Install complete]"$(DEFAULT) || $(ECHO) $(BOLD) $(RED)"[Install failed]"$(DEFAULT)

install_prod:
	@$(ECHO) $(BOLD) $(CYAN)"[Installing production environment]" $(DEFAULT)
	@cd $(WORKSPACE) && pnpm install --prod && $(ECHO) $(BOLD) $(GREEN)"[Install complete]"$(DEFAULT) || $(ECHO) $(BOLD) $(RED)"[Install failed]"$(DEFAULT)

clean:
	@$(ECHO) $(BOLD) $(CYAN)"[Cleaning workspace]" $(DEFAULT)
	@cd $(WORKSPACE) && pnpm run clean && $(ECHO) $(BOLD) $(GREEN)"[Clean complete]"$(DEFAULT) || $(ECHO) $(BOLD) $(RED)"[Clean failed]"$(DEFAULT)

re: clean install all
re_prod: clean install_prod all

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