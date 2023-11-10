import typia from "typia";

export interface IMembership {
    id: string & typia.tags.Format<"uuid">;
    /** 멤버십 등급명 */
    name: string;
    /** 멤버십 등급 대표 이미지 주소 */
    image_url: (string & typia.tags.Format<"url">) | null;
    /**
     * 멤버십 등급 단계
     *
     * 계층형 멤버십 등급을 비교하기 위해 사용되는 값
     */
    rank: number & typia.tags.Type<"uint64">;
}
