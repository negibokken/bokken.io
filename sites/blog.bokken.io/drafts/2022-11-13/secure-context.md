# Secure Context についてまとめる

@tags: [Secure Context, webappsec]

@date: [2022-11-13, 2022-11-13]

## はじめに

Web 関連の仕様を読んでいると、Secure Context という単語がたびたび出てくる。
Web のコンテキストにおいてセキュアとはどういう状態のことなのか、気になったので、2022年11月13日現在の[Secure Contexts](https://www.w3.org/TR/secure-contexts/)に基づいてまとめる。

## TL;DR

ひとことで Secure Context を表すと、先祖のコンテキストや関連するコンテキストまで含めて暗号化された通信をしているコンテキストのことだといえる。

あるコンテキストがどういう通信をしたか、コンテキストの frame や Web Worker / Service Worker がどのオリジンから呼び出されたかによってセキュアかどうかが異なる。

次節以降で仕様を参考に述べていく。

## Secure Context の条件

- トップレベルのドキュメント
- Framed Document
- Web Worker
- Shared Worker
- Service Worker

## Is origin potentially trustworthy

[Is origin potentially trustworthy? を判定するアルゴリズム](https://www.w3.org/TR/secure-contexts/#is-origin-trustworthy) は下記のとおりだ。

> 1. If origin is an opaque origin, return "Not Trustworthy".
> 1. Assert: origin is a tuple origin.
> 1. If origin’s scheme is either "https" or "wss", return "Potentially Trustworthy".
> 1. If origin’s host matches one of the CIDR notations 127.0.0.0/8 or ::1/128 [RFC4632], return "Potentially Trustworthy".
> 1. If the user agent conforms to the name resolution rules in [let-localhost-be-localhost] and one of the following is true:
>    - origin’s host is "localhost" or "localhost."
>    - origin’s host ends with ".localhost" or ".localhost."
>
>    then return "Potentially Trustworthy".
> 1. If origin’s scheme is "file", return "Potentially Trustworthy".
> 1. If origin’s scheme component is one which the user agent considers to be authenticated, return "Potentially Trustworthy".
> 1. If origin has been configured as a trustworthy origin, return "Potentially Trustworthy".
> 1. Return "Not Trustworthy".

## Is url potentially trustworthy

[Is url potentially trustworthy? を判定するアルゴリズム](https://www.w3.org/TR/secure-contexts/#is-url-trustworthy) は下記のとおりだ。

> 1. If url is "about:blank" or "about:srcdoc", return "Potentially Trustworthy".
> 1. If url’s scheme is "data", return "Potentially Trustworthy".
> 1. Return the result of executing § 3.1 Is origin potentially trustworthy? on url’s origin.

## 脅威モデル

## セキュリティ検討事項

## IDL の定義について

```cpp
interface ExampleFeature {
  // This call will succeed in all contexts.
  Promise <double> calculateNotSoSecretResult();

  // This operation will not be exposed to a non-secure context.
  [SecureContext] Promise<double> calculateSecretResult();

  // The same applies here: the operation will not be exposed to a non-secure context.
  [SecureContext] boolean getSecretBoolean();
};

[SecureContext]
interface SecureFeature {
  // This interface will not be exposed to non-secure contexts.
  Promise<any> doAmazingThing();
};
```

## 終わりに

## 参考

1. [Secure Contexts](https://www.w3.org/TR/secure-contexts/)
1. [Secure contexts - Web security | MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
