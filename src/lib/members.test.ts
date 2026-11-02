import { describe, expect, test } from "vitest";
import {
  arrangeSeats,
  assignSeat,
  findMember,
  joinLunch,
  leaveLunch,
  markMe,
  summarizeTable,
} from "@/lib/members";

// SPEC.md 6.3「席の決め方」・8.1「基本の流れ」・8.3「参加と席のルール」

/** 参加者のデータの形（今のダミーデータに、席なし＝null を足したもの） */
type Member = {
  id: string;
  name: string;
  memo: string;
  topping: string;
  seat: number | null;
};

/** 今のダミーデータと同じ3人（席 0・3・5） */
const dummyMembers: Member[] = [
  { id: "tanaka", name: "田中 さくら", memo: "10月に中途で入社しました！", topping: "#e27d7a", seat: 0 },
  { id: "sato", name: "佐藤 健", memo: "そばの気分。営業部です", topping: "#ef9f6e", seat: 3 },
  { id: "suzuki", name: "鈴木 美咲", memo: "", topping: "#e9b949", seat: 5 },
];

/** 指定した席に人を並べる */
function membersAt(seats: (number | null)[]): Member[] {
  return seats.map((seat, i) => ({
    id: `user${i}`,
    name: `参加者${i}`,
    memo: "",
    topping: "#e27d7a",
    seat,
  }));
}

/** 自分（これから参加する人） */
const me = { id: "me", name: "吉田 琴乃", memo: "", topping: "#6fae92" };

describe("assignSeat：参加する人の席を決める", () => {
  test("誰もいなければ 0 番の席", () => {
    expect(assignSeat([], "me")).toBe(0);
  });

  test("空いている席のうち、番号のいちばん小さい席（ダミーの 0・3・5 なら 1）", () => {
    expect(assignSeat(dummyMembers, "me")).toBe(1);
  });

  test("途中が空いていれば、そこに入る", () => {
    expect(assignSeat(membersAt([0, 1, 2, 4]), "me")).toBe(3);
  });

  test("並び順に関係なく、いちばん小さい空き番号を選ぶ", () => {
    expect(assignSeat(membersAt([2, 0, 1]), "me")).toBe(3);
  });

  test("7 番だけ空いていれば 7 番", () => {
    expect(assignSeat(membersAt([0, 1, 2, 3, 4, 5, 6]), "me")).toBe(7);
  });

  test("8席すべて埋まっていたら、席なし（null）", () => {
    expect(assignSeat(membersAt([0, 1, 2, 3, 4, 5, 6, 7]), "me")).toBeNull();
  });

  test("席なしの人がいても、席の決め方は変わらない", () => {
    expect(assignSeat(membersAt([0, null, 2]), "me")).toBe(1);
  });

  test("すでに参加している人は、新しい席を取らない", () => {
    const members = [...dummyMembers, { ...me, seat: 1 }];
    expect(assignSeat(members, "me")).toBe("alreadyJoined");
  });

  test("席なしで参加済みの人も、参加済みとして扱う", () => {
    const members = [...membersAt([0, 1, 2, 3, 4, 5, 6, 7]), { ...me, seat: null }];
    expect(assignSeat(members, "me")).toBe("alreadyJoined");
  });
});

describe("joinLunch：参加すると、メンバーに自分が加わる", () => {
  test("ダミーの3人に自分が加わって4人になり、自分は 1 番の席に入る", () => {
    const result = joinLunch(dummyMembers, me);
    expect(result).toHaveLength(4);
    expect(result.find((m) => m.id === "me")).toEqual({ ...me, seat: 1 });
  });

  test("もとのメンバーの席は変わらない", () => {
    const result = joinLunch(dummyMembers, me);
    for (const m of dummyMembers) {
      expect(result.find((r) => r.id === m.id)).toEqual(m);
    }
  });

  test("8席すべて埋まっていても、席なしで参加できる", () => {
    const result = joinLunch(membersAt([0, 1, 2, 3, 4, 5, 6, 7]), me);
    expect(result).toHaveLength(9);
    expect(result.find((m) => m.id === "me")?.seat).toBeNull();
  });

  test("すでに参加している人がもう一度参加しても、メンバーは変わらない", () => {
    const members = [...dummyMembers, { ...me, seat: 1 }];
    expect(joinLunch(members, me)).toEqual(members);
  });

  test("もとの配列は書き換えない", () => {
    const before = structuredClone(dummyMembers);
    joinLunch(dummyMembers, me);
    expect(dummyMembers).toEqual(before);
  });

  test("同じ名前の人が2人いても、id が違えば両方参加でき、別々の席に入る", () => {
    const first = { id: "tanaka1", name: "田中 さくら", memo: "", topping: "#e27d7a" };
    const second = { id: "tanaka2", name: "田中 さくら", memo: "", topping: "#ef9f6e" };
    const noMembers: Member[] = [];
    const result = joinLunch(joinLunch(noMembers, first), second);
    expect(result).toHaveLength(2);
    expect(result.find((m) => m.id === "tanaka1")?.seat).toBe(0);
    expect(result.find((m) => m.id === "tanaka2")?.seat).toBe(1);
  });
});

describe("席は後から移らない（席なしの人は、席が空いても席なしのまま）", () => {
  /** 席 0〜7 の8人と、席なしの1人（user8） */
  const nineMembers = membersAt([0, 1, 2, 3, 4, 5, 6, 7, null]);

  test("席 3 の人がやめても、席なしの人は席なしのまま", () => {
    const result = leaveLunch(nineMembers, "user3");
    expect(result.find((m) => m.id === "user8")?.seat).toBeNull();
  });

  test("その後に新しく参加した人が、空いた席 3 に入る", () => {
    const result = joinLunch(leaveLunch(nineMembers, "user3"), me);
    expect(result.find((m) => m.id === "me")?.seat).toBe(3);
    expect(result.find((m) => m.id === "user8")?.seat).toBeNull();
  });
});

describe("leaveLunch：参加をやめると、メンバーから自分が消える", () => {
  test("4人から自分が消えて3人に戻る", () => {
    const members = [...dummyMembers, { ...me, seat: 1 }];
    expect(leaveLunch(members, "me")).toEqual(dummyMembers);
  });

  test("参加していない人がやめても、メンバーは変わらない", () => {
    expect(leaveLunch(dummyMembers, "me")).toEqual(dummyMembers);
  });

  test("ほかの人は消えない", () => {
    const result = leaveLunch(dummyMembers, "sato");
    expect(result.map((m) => m.id)).toEqual(["tanaka", "suzuki"]);
  });
});

describe("summarizeTable：人数をそろえる（見出し・一覧・テーブル・「ほかに◯人」）", () => {
  test("ダミーの3人は、全員が席にいる", () => {
    expect(summarizeTable(dummyMembers)).toEqual({ total: 3, seated: 3, others: 0 });
  });

  test("誰もいない", () => {
    expect(summarizeTable([])).toEqual({ total: 0, seated: 0, others: 0 });
  });

  test("9人なら、席に8人・ほかに1人", () => {
    const members = membersAt([0, 1, 2, 3, 4, 5, 6, 7, null]);
    expect(summarizeTable(members)).toEqual({ total: 9, seated: 8, others: 1 });
  });

  test("席にいる人と「ほかに◯人」を足すと、全体の人数になる", () => {
    const members = membersAt([0, 1, 2, 3, 4, 5, 6, 7, null, null, null]);
    const { total, seated, others } = summarizeTable(members);
    expect(seated + others).toBe(total);
    expect(total).toBe(11);
  });
});

describe("findMember：id で参加者を探す", () => {
  test("いる人 → その人", () => {
    expect(findMember(dummyMembers, "sato")?.name).toBe("佐藤 健");
  });

  test("いない人 → undefined", () => {
    expect(findMember(dummyMembers, "nobody")).toBeUndefined();
  });
});

describe("markMe：自分かどうかの印を付ける", () => {
  test("自分だけ isMe が true になる", () => {
    expect(markMe(dummyMembers, "sato").map((m) => m.isMe)).toEqual([false, true, false]);
  });

  test("自分がいなければ、全員 false", () => {
    expect(markMe(dummyMembers, "me").every((m) => !m.isMe)).toBe(true);
  });

  test("もとの配列は書き換えない", () => {
    const before = structuredClone(dummyMembers);
    markMe(dummyMembers, "sato");
    expect(dummyMembers).toEqual(before);
  });
});

describe("arrangeSeats：テーブルの8席に人を並べる", () => {
  test("いつも8席を、席番号の順に返す", () => {
    expect(arrangeSeats([]).map((s) => s.seat)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  test("誰もいなければ、全部空いている", () => {
    expect(arrangeSeats([]).every((s) => s.member === null)).toBe(true);
  });

  test("ダミーの3人は、席 0・3・5 に座る", () => {
    const ids = arrangeSeats(dummyMembers).map((s) => s.member?.id ?? null);
    expect(ids).toEqual(["tanaka", null, null, "sato", null, "suzuki", null, null]);
  });

  test("席なしの人はテーブルに並ばない", () => {
    const members = membersAt([0, 1, 2, 3, 4, 5, 6, 7, null]);
    const seated = arrangeSeats(members).filter((s) => s.member !== null);
    expect(seated).toHaveLength(8);
    expect(seated.some((s) => s.member?.seat === null)).toBe(false);
  });
});
