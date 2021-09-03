# --- ここから追加 ---
module Api
  module V1
    class LineFoodsController < ApplicationController
      before_action :set_food, only: %i[create replace]
      # 仮注文済みの食べ物一覧を表示
      def index
        # 有効な仮注文を取得
        line_foods = LineFood.active
        # 仮注文があれば、仮注文の情報内容を返す
        if line_foods.exists?
          render json: {
            line_food_ids: line_foods.map { |line_food| line_food.id },
            restaurant: line_foods[0].restaurant,
            count: line_foods.sum { |line_food| line_food[:count] },
            amount: line_foods.sum { |line_food| line_food.total_amount },
          }, status: :ok
        # もし、仮注文が存在しない場合は空のレスポンスを返す
        else
          render json: {}, status: :no_content
        end
      end

      # 食べ物の仮注文を送信
      def create
        # 他店舗でアクティブな仮注文の有無を検証
        if LineFood.active.other_restaurant(@ordered_food.restaurant.id).exists?
          return render json: {
            existing_restaurant: LineFood.other_restaurant(@ordered_food.restaurant.id).first.restaurant.name,
            new_restaurant: Food.find(params[:food_id]).restaurant.name,
          }, status: :not_acceptable
        end

        # 例外処理でない場合には仮注文インスタンスを作成
        set_line_food(@ordered_food)

        # 仮注文の確定
        if @line_food.save
          render json: {
            line_food: @line_food
          }, status: :created
        else
          render json: {}, status: :internal_server_error
        end
      end

      # 他店の仮注文済み(active)の食べ物を削除して新規に仮注文を作成
      def replace
        LineFood.active.other_restaurant(@ordered_food.restaurant.id).each do |line_food|
          line_food.update_attribute(:active, false)
        end

        # ユーザーの注文した食べ物(@orderd_food)を元に仮注文(@line_food)を作成
        set_line_food(@ordered_food)

        # 仮注文がDBに保存できれば
        if @line_food.save
          render json: {
            line_food: @line_food
          }, status: :created
        else
          render json: {}, status: :internal_server_error
        end
      end

      private

      def set_food
        @ordered_food = Food.find(params[:food_id])
      end

      def set_line_food(ordered_food)
        # 注文した食べ物はすでに仮注文に入っている？
        if ordered_food.line_food.present?
          @line_food = ordered_food.line_food
          @line_food.attributes = {
            # 仮注文中の食べ物の数に新たに注文した食べ物の数を追加
            count: ordered_food.line_food.count + params[:count],
            # 仮注文を有効状態にする
            active: true
          }
        else
          # 仮注文インスタンスを生成
          @line_food = ordered_food.build_line_food(
            count: params[:count],
            restaurant: ordered_food.restaurant,
            active: true
          )
        end
      end
    end
  end
end