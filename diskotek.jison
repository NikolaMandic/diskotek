/* beeScript grammar
 * copyright (c) Nikola Mandic 2013
 * */
/* diskotekScript */

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
"def"                   return 'DEF'

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
statement:expressionStatement | ifs | whiles | ife| 
IDENT "(" ")"   
|
 IDENT "(" expList ")" 
|
 fieldAccess "(" expList ")" 
|
 fieldAccess "("  ")" 
;



expressionStatement :  assignment | fieldAccess |  

DEF IDENT "(" ")"  NEWLINE statementList 
|
DEF  IDENT "(" expList ")" NEWLINE statementList 
|
DEF  fieldAccess "(" expList ")" NEWLINE statementList 
|
DEF  fieldAccess "("  ")" NEWLINE statementList
;
whiles : WHILE expSList NEWLINE statementList ;

expSList: expressionStatement sep expSList | expressionStatement;
sep: ANY;
funcSig : IDENT "(" ")";
funcSig : IDENT "(" expList ")";
ifs: IF condition NEWLINE statementList ;
ife: IF condition NEWLINE statementList ELSE statementList ;
condition: expList | expList cop expList;
arg : expList  ;
cop : "==" | "!=" |  "&&" | "|";
argList : arg | argCommaList;
argCommaList : "," arg | "," argCommaList;
methodInvocation : IDENT "(" argList ")";
methodInvocation : IDENT "("  ")";
methodInvocation : fieldAccess "(" argList ")";
methodInvocation : fieldAccess "("  ")";


assignment : fieldAccess EQ expList | IDENT ;
assignment : IDENT EQ expList ;

op: "+"|"-"|"/"|"*";
expList :  term  | expList op term | "(" expList op term ")";
term: IDENT | NUMBER | fieldAccess;




