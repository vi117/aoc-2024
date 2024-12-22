
기본적인 정의를 합니다.

```my-ml-like-sudo-language
// fg is shortest available pathes function that returns a path from pos to target.
// type cmd :: enum {
//   up'^', down'v', right'<', left'>', accept'A'
// }
// type path_set = set of list of cmd;
```

이제 헬퍼 함수를 정이합니다.

```
// \product is a function that returns a list of all possible combinations of two lists.
// \product :: path_set -> path_set -> path_set
// \product [] ys = []
// \product xs [] = []
// \product (x:xs) y = (concat x y) ++ (\product xs y)
// infix 5 \product // associativity is not important. because it commutative.

// ++ is union of two sets.
// concat :: cmd -> path_set -> path_set
// concat x [] = [x]
// concat x (y:ys) = (x:y) ++ (concat x ys)

// product :: path_set -> path_set -> path_set
// product a b = a \product b

```

```my-ml-like

type start_pos = cmd
type target_pos = cmd
type next_pos = cmd
available_paths ::  start_pos -> target_pos -> path_set
type Handler 'T :: start_pos -> ('T, next_pos)

// define unit, mappend. these are monoid.

// 

// unit :: Handler of path_set
// unit = s -> t -> (t, s)
// mappend :: Handler of path_set -> Handler of path_set -> Handler of path_set
// mappend f g = s -> 
//  let (t, s') = f s in
//  let (a ,s'') = g s'
//  in ( (product t a )  , s'')
// 
// move :: Handler of (cmd -> set of list of cmd)

// move s cmds x = available_paths x \product  
// accept :: Handler of (list of cmd -> list of cmd)

// f = fg 'A'
// f :: (list of cmd) -> set of (list of cmd)
// statement execute 'A' (f (x)) = x
// f x = move x; accept;
// f x:tails = (move x; accept; f tails) 'A'
// sl is get shortest path length
// sl :: list of cmd -> Int
// sl cmd = (f cmd) |> (foldr (x,y) -> min(x,y), INF)

// operator \product is a function that returns a list of all possible combinations of two lists.
// \product :: list of cmd -> list of cmd -> list of cmd
// \product [] ys = ys
// \product xs [] = xs
// \product (x:xs) (y:ys) = x \product (y:ys) ++ xs \product (y:ys)
// infixr 5 \product

// sl (a \product b) = sl a + sl b
// f /(.*)A/:rest = f '$1A' \product f rest
// sl(f /(.*)A/:rest)) = sl (f '$1A' \product f rest)
//                     = sl (f '$1A') + sl (f rest)
// 
```