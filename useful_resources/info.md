# predefined language files

## Affix

Type (suffix or prefixx) | POS(word's Part Of Speech that combined with, noune, verb..etc) | Meaning(like preffix un- means not) | Resulted (the POS that word changed to, like move(verb) + able(suffix) = movable(subjective), cow(singular) + s = cows(plural)..etc)

## none Noun and Verb POS (language tools)

 Before (POS of word before the suffix) | After | ConsidredBeforePOS (Before POS considred as a DEP, like noun as a subject or object)| ConsidredAfterPOS | ConsidredBeforeCategory (Before POS Category, like POS noun of Category Person that is male : [person, male]) | ConsidredAfterCategory | Resulted phrase/sentences

**NOTEs** : 
- seems it is better to make that as general template, where each language tools group has these properties and more depending on the group, like tense and sigularity/plurality in vebs to .. etc
- a one tool could have more thaan two rows for diferent case like : man -is- strong(affermative),  -is-good(could be affermative or quesiton, detemined later by its position in x-bar tree)

## Noun dictionary

noun | category_list (person, animal, plant, machine, country, ..etc, it is list becuase it could have more than category, like "Anna" is [person,female]) | singularity(singular or plural)

## Verb dictionary

verb | Owner (Noun of the subject that does the verb, like eating for animals, flying for  planes..etc)


# cases

## unknown word between two words
by using Affix to get word without affixes, then using its position in sentences to language tools