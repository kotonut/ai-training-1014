import { describe, expect, test } from "vitest";
import {
  arrangeSeats,
  displayTopping,
  assignSeat,
  findMember,
  markMe,
  pickTopping,
  summarizeTable,
  type StoredTopping,
} from "@/lib/members";

// SPEC.md 6.3「席の決め方」・8.1「基本の流れ」・8.3「参加と席のルール」

/** 参加者のデータの形（今のダミーデータに、席なし＝null を足したもの） */
type Member = {
  id: string;
  name: string;
  memo: string;
  topping: StoredTopping;
  seat: number | null;
};

/** 今のダミーデータと同じ3人（席 0・3・5） */
const dummyMembers: Member[] = [
  { id: "tanaka", name: "田中 さくら", memo: "10月に中途で入社しました！", topping: "ume", seat: 0 },
  { id: "sato", name: "佐藤 健", memo: "そばの気分。営業部です", topping: "sake", seat: 3 },
  { id: "suzuki", name: "鈴木 美咲", memo: "", topping: "tamago", seat: 5 },
];

/** 指定した席に人を並べる */
function membersAt(seats: (number | null)[]): Member[] {
  return seats.map((seat, i) => ({
    id: `user${i}`,
    name: `参加者${i}`,
    memo: "",
    topping: "ume",
    seat,
  }));
}

/** 自分（これから参加する人） */
const me: Omit<Member, "seat"> = { id: "me", name: "吉田 琴乃", memo: "", topping: "ume" };

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

describe("assignSeat：同じ名前の人・席なしの人", () => {
  test("同じ名前の人が2人いても、id が違えば別々の席に入る", () => {
    const first: Member = { id: "tanaka1", name: "田中 さくら", memo: "", topping: "ume", seat: 0 };
    expect(assignSeat([first], "tanaka2")).toBe(1);
  });

  test("席 3 の人がやめた後に参加した人は、空いた席 3 に入る（席なしの人は移らない）", () => {
    // 席 0〜7 の8人と席なしの1人（user8）から、席 3 の人（user3）がやめた
    const members = membersAt([0, 1, 2, 3, 4, 5, 6, 7, null]).filter((m) => m.id !== "user3");
    expect(assignSeat(members, "me")).toBe(3);
    expect(members.find((m) => m.id === "user8")?.seat).toBeNull();
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

describe("pickTopping：その人の具を決める", () => {
  test("梅・鮭・卵のどれか", () => {
    for (const id of ["a", "b", "c", "uid-123", "XyZ9"]) {
      expect(["ume", "sake", "tamago"]).toContain(pickTopping(id));
    }
  });

  test("同じ人なら毎回同じ具", () => {
    expect(pickTopping("abcDEF123")).toBe(pickTopping("abcDEF123"));
  });

  test("人によって違う具になる", () => {
    const toppings = new Set(["a", "b", "c"].map(pickTopping));
    expect(toppings.size).toBe(3);
  });
});

describe("displayTopping：画面に出す具", () => {
  test("自分は mine（緑）", () => {
    expect(displayTopping({ topping: "sake" }, true)).toBe("mine");
  });

  test("ほかの人は保存した具", () => {
    expect(displayTopping({ topping: "sake" }, false)).toBe("sake");
  });
});
