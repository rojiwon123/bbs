import { Num, Regex } from "./global";

export interface IMembership {
    id: Regex.UUID;
    /** 멤버십 등급명 */
    name: string;
    /** 멤버십 등급 대표 이미지 주소 */
    image_url: Regex.URL | null;
    /**
     * 멤버십 등급 단계
     *
     * 계층형 멤버십 등급을 비교하기 위해 사용되는 값
     */
    rank: Num.UInt64;
}
