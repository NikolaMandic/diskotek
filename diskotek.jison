/* beeScript grammar
 * copyright (c) Nikola Mandic 2013
 * */

/* lexical grammar */
%lex
%%

[ ]+                   /* skip whitespace */
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
\n                    return 'NEWLINE'
"while"                    return 'WHILE'
"."                   return 'DOT'
"|"                   return '|'
"&&"                   return '&&'
"=="                   return '=='
"!="                   return '!='
"="                   return 'EQ'
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"+"                   return ','
"^"                   return '^'
"("                   return '('
"if"                   return 'IF'
"else"                   return 'ELSE'
")"                   return ')'
"PI"                  return 'PI'
"E"                   return 'E'

\w+                   return "IDENT"
<<EOF>>               return 'EOF'

.                     return 'ANY'

/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left '^'
%left UMINUS

%start statementList

%% /* language grammar */

expressions
    : e EOF
        {return $1;}
    | e NEWLINE 
EOF
{return 'newline'; }
    ;
accessorList :
   DOT IDENT accessorList | DOT IDENT ;
fieldAccess :
   IDENT accessorList;


statementList :  statement  end | statement NEWLINE statementList ;
end : NEWLINE | EOF ;
statement:expressionStatement | ifs | whiles | ife;
expressionStatement :  assignment | methodInvocation ;
whiles : WHILE expSList NEWLINE statementList ;

expSList: expressionStatement sep expSList | expressionStatement;
sep: ANY;

ifs: IF condition NEWLINE statementList ;
ife: IF condition NEWLINE statementList ELSE statementList ;
condition: expList | expList cop expList;
arg : expList  ;
cop : "==" | "!=" |  "&&" | "|";
argList : arg | argCommaList;
argCommaList : "," arg | "," argCommaList;
methodInvocation : IDENT "(" argList ")";
methodInvocation : IDENT "(" ")";

assignment : IDENT EQ expList | IDENT ;

op: "+"|"-"|"/"|"*";
expList :  term  | expList op term | "(" expList op term ")";
term: IDENT | NUMBER | fieldAccess;




