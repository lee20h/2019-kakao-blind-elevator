# 카카오 2차 블라인드 테스트 구현

- [서버](https://github.com/kakao-recruit/2019-blind-2nd-elevator)

## 문제

- [문제](https://github.com/kakao-recruit/2019-blind-2nd-elevator/blob/master/docs/QUESTIONS.md)

현재는 먼저 들어온 요청에 대해서 엘리베이터 알고리즘을 적용하도록 구성하였다. 엘리베이터 클래스를 호출을 받는 함수와 현재 엘리베이터의 상태를 이용해서 행동을 결정하는 함수 두 가지로 구성하였다.

이후에 API를 통해서 받아온 호출들 중 해결하지 않은 호출들을 차례차례 엘리베이터마다 할당해줘서 작동하게 한다.

### 0번

![image](https://user-images.githubusercontent.com/59367782/105730355-9aeb7f00-5f71-11eb-9870-196bbbe4b1ee.png)

### 1번

![image](https://user-images.githubusercontent.com/59367782/105730327-91faad80-5f71-11eb-8bd7-1d12833615c9.png)

### 2번

![image](https://user-images.githubusercontent.com/59367782/105730414-ab9bf500-5f71-11eb-851e-11dc9703046b.png)

## 수정사항

현재 알고리즘은 처음에 요청을 받은 뒤 요청을 따라서 도착 층까지 간다. 도착 층까지 가는 사이에 출발 층과 도착 층이 존재한다면 멈춰서 태우는 방식이다.

하지만, 문제 2번인 라이언 타워에서는 출입구가 정해져있고, 사람들이 자주 가는 층이 정해져있다. 따라서 같은 층을 가는 사람들을 한번에 태워서 이동을 해야 훨씬 빠르게 이동할 수 있다.

1번 문제까지는 밝혀지지 않았던 문제점이지만 2번 문제를 통해서 알게 되었으므로, 그러한 부분을 추가해야한다.
