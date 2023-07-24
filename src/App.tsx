import React, { useEffect, useRef, useState } from "react";

type Order = {
  id: number;
  type: "normal" | "vip";
  status: "pending" | "completed";
  processed_by: number | null;
};

type Bot = {
  id: number;
  status: "idle" | "processing";
  timeout_handler: any;
  order_id: number | null;
};

class BotController {}
class Bott {}

const useOrderHook = () => {
  const currentOrderIDRef = useRef(0);
  const currentBotIDRef = useRef(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    if (bots.length === 0) return;
    if (orders.length === 0) return;

    const bot_index = bots.findIndex((bot) => bot.status === "idle");
    const bot = bots[bot_index];

    if (!bot) return;

    const order_index = orders.findIndex(
      (order) => order.status === "pending" && order.processed_by === null
    );
    const order = orders[order_index];

    if (order_index === -1) return;

    const timeout_handler = setTimeout(() => {
      setOrders((orders) => {
        const order_index = orders.findIndex((o) => o.id === order.id);
        const new_orders = [...orders];
        new_orders.splice(order_index, 1, {
          ...order,
          status: "completed",
          processed_by: null,
        });
        return new_orders;
      });
      setBots((bots) => {
        const bot_index = bots.findIndex((b) => b.id === bot.id);
        const new_bots = [...bots];
        new_bots.splice(bot_index, 1, {
          ...bot,
          status: "idle",
          order_id: null,
          timeout_handler: null,
        });
        return new_bots;
      });
    }, 2000);

    setOrders((orders) => {
      const new_orders = [...orders];
      new_orders.splice(order_index, 1, { ...order, processed_by: bot.id });
      return new_orders;
    });

    setBots((bots) => {
      const new_bots = [...bots];
      new_bots.splice(bot_index, 1, {
        ...bot,
        status: "processing",
        timeout_handler,
        order_id: order.id,
      });
      return new_bots;
    });
  }, [bots, orders]);

  const addOrder = (type: "normal" | "vip") => {
    currentOrderIDRef.current++;
    if (type === "normal") {
      setOrders((orders) => [
        ...orders,
        {
          id: currentOrderIDRef.current,
          type: "normal",
          status: "pending",
          processed_by: null,
        },
      ]);
      return;
    }

    if (type === "vip") {
      const insert_at = orders.findIndex((order) => order.type === "normal");
      setOrders((orders) => [
        ...orders.slice(0, insert_at),
        {
          id: currentOrderIDRef.current,
          type: "vip",
          status: "pending",
          processed_by: null,
        },
        ...orders.slice(insert_at),
      ]);
      return;
    }
  };

  const addBot = () => {
    currentBotIDRef.current++;
    setBots((bots) => [
      ...bots,
      {
        id: currentBotIDRef.current,
        status: "idle",
        timeout_handler: null,
        order_id: null,
      },
    ]);
  };

  const removeBot = () => {
    if (currentBotIDRef.current === 0) return;

    const bot = bots.find((bot) => bot.id === currentBotIDRef.current);

    if (!bot) return;

    if (bot.timeout_handler) {
      clearTimeout(bot.timeout_handler);

      setOrders((orders) => {
        const order_index = orders.findIndex((o) => o.id === bot.order_id);
        const order = orders[order_index];
        const new_orders = [...orders];
        new_orders.splice(order_index, 1, {
          ...order,
          status: "pending",
          processed_by: null,
        });
        return new_orders;
      });
    }

    const new_bots = bots.filter((bot) => bot.id !== currentBotIDRef.current);
    currentBotIDRef.current--;
    setBots((bots) => new_bots);
  };

  return {
    addOrder,
    addBot,
    removeBot,
    orders,
    bots,
  };
};

function App() {
  const { addOrder, addBot, removeBot, orders, bots } = useOrderHook();
  return (
    <div>
      <button
        onClick={() => {
          addOrder("normal");
        }}
      >
        + Normal Order
      </button>
      <button
        onClick={() => {
          addOrder("vip");
        }}
      >
        + VIP Order
      </button>
      <button onClick={addBot}>+ Bot</button>
      <button onClick={removeBot}>- Bot</button>
      <div>Pending</div>
      {orders
        .filter((order) => order.status === "pending")
        .map((order) => (
          <div>
            {order.id} - {order.status} - {order.type} - {order.processed_by}
          </div>
        ))}
      <br />
      <div>Completed</div>
      {orders
        .filter((order) => order.status === "completed")
        .map((order) => (
          <div>
            {order.id} - {order.status} - {order.type} - {order.processed_by}
          </div>
        ))}
      <br />
      <div>Bots</div>
      {bots.map((bot) => (
        <div>
          {bot.id} - {bot.status}
        </div>
      ))}
    </div>
  );
}

export default App;
