<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CartUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $userId,
        public int $cartCount
    ) {}

    public function broadcastOn()
    {
        return new PrivateChannel('cart.' . $this->userId);
    }

    public function broadcastAs()
    {
        return 'cart.updated';
    }

    public function broadcastWith()
    {
        return [
            'cartCount' => $this->cartCount
        ];
    }
}
